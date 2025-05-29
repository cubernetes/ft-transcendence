import { PongEngine, Position3D, Size3D, UserInput, Vector3D } from "../pong/pong.types";
import { AIConfig, AIDifficulty, AIPlayer } from "./ai.types";

const AI_UPDATE_INTERVAL = 1000; // AI makes strategic decisions every 1 second (requirement)
const TACTICAL_UPDATE_INTERVAL = 30;

const DIFFICULTY_LEVELS: Record<AIDifficulty, AIConfig> = {
    EASY: {
        maxDepth: 8,
        reactionSpeedMultiplier: 0.7,
        randomnessFactor: 0.1,
    },
    MEDIUM: {
        maxDepth: 12,
        reactionSpeedMultiplier: 0.85,
        randomnessFactor: 0.05,
    },
    HARD: {
        maxDepth: 30,
        reactionSpeedMultiplier: 0.99,
        randomnessFactor: 0.005,
    },
};

interface GameSnapshot {
    ball: { pos: Position3D; vec: Vector3D; r: number; speed: number };
    paddle: {
        pos: Position3D;
        size: { width: number; height: number; depth: number };
        speed: number;
    };
    boardSize: Size3D;
    timestamp: number;
}

export const createAIPlayer = (
    engine: Pick<PongEngine, "onEvent" | "setInput" | "getConfig">,
    difficulty: AIDifficulty,
    playerIndex: 0 | 1 = 1
) => {
    const config = DIFFICULTY_LEVELS[difficulty];
    let gameSnapshot: GameSnapshot | null = null;
    let currentInput: UserInput = "stop";
    let lastDecisionTime = 0;
    let lastTacticalTime = 0;
    let strategicTarget = 0;
    let lastPredictedPosition = 0;

    let missedPredictions = 0;
    let totalPredictions = 0;

    const aiPlayer: AIPlayer = {
        playerIndex,
        lastUpdateTime: Date.now(),
        engine,
        difficulty,
        isActive: true,
    };

    // Capture game state updates - this happens every frame
    engine.onEvent("state-update", (evt) => {
        if (!aiPlayer.isActive) return;

        const { ball, paddles } = evt.state;
        const paddle = paddles[playerIndex];
        const gameConfig = engine.getConfig();

        gameSnapshot = {
            ball: { ...ball, speed: Math.sqrt(ball.vec.x ** 2 + ball.vec.z ** 2) },
            paddle: { ...paddle },
            boardSize: { ...gameConfig.board.size },
            timestamp: Date.now(),
        };

        // Tactical updates - more frequent adjustments following the strategic plan
        const now = Date.now();
        if (now - lastTacticalTime >= TACTICAL_UPDATE_INTERVAL && strategicTarget !== 0) {
            lastTacticalTime = now;
            tacticalAdjustment();
        }
    });

    engine.onEvent("paddle-collision", () => {
        if (!gameSnapshot) return;

        const predictionError = Math.abs(gameSnapshot.ball.pos.z - lastPredictedPosition);
        totalPredictions++;

        if (predictionError > gameSnapshot.ball.r * 2) {
            missedPredictions++;
        }
    });

    // AI decision loop - only runs every 1 second as required
    const makeDecision = (): void => {
        if (!aiPlayer.isActive || !gameSnapshot) {
            setTimeout(makeDecision, AI_UPDATE_INTERVAL);
            return;
        }

        const now = Date.now();
        if (now - lastDecisionTime < AI_UPDATE_INTERVAL) {
            setTimeout(makeDecision, AI_UPDATE_INTERVAL - (now - lastDecisionTime));
            return;
        }
        lastDecisionTime = now;

        strategicTarget = calculateTargetPosition(gameSnapshot, config);

        const newInput = decideInput(gameSnapshot, strategicTarget, config);

        const baseDelay = difficulty === "HARD" ? 5 : difficulty === "MEDIUM" ? 10 : 20;
        const maxAdditionalDelay = difficulty === "HARD" ? 20 : difficulty === "MEDIUM" ? 50 : 150;
        const reactionDelay = baseDelay + (1 - config.reactionSpeedMultiplier) * maxAdditionalDelay;

        setTimeout(() => {
            if (aiPlayer.isActive && newInput !== currentInput) {
                currentInput = newInput;
                engine.setInput(playerIndex, currentInput); // a requirement for user input
            }
        }, reactionDelay);

        setTimeout(makeDecision, AI_UPDATE_INTERVAL);
    };

    const calculateTargetPosition = (snapshot: GameSnapshot, config: AIConfig): number => {
        const { ball } = snapshot;

        const isMovingTowardUs =
            (playerIndex === 0 && ball.vec.x < 0) || (playerIndex === 1 && ball.vec.x > 0);

        if (isMovingTowardUs) {
            const prediction = predictBallPosition(snapshot, config);
            lastPredictedPosition = prediction.position;

            let strategicOffset = 0;

            if (difficulty === "HARD" && prediction.confidence > 0.8) {
                const centerWeight = 0.1;
                strategicOffset = -prediction.position * centerWeight;
            }

            return prediction.position + strategicOffset;
        } else {
            const futureTime = difficulty === "HARD" ? 1.5 : 1.0;
            const predictedBallZ = ball.pos.z + ball.vec.z * futureTime * 60;

            const centerWeight = difficulty === "EASY" ? 0.3 : 0.1;
            return predictedBallZ * (1 - centerWeight);
        }
    };

    const decideInput = (snapshot: GameSnapshot, target: number, config: AIConfig): UserInput => {
        const { paddle } = snapshot;
        const currentZ = paddle.pos.z;

        const randomOffset = (Math.random() - 0.5) * config.randomnessFactor;
        const adjustedTarget = target + randomOffset;

        const difference = adjustedTarget - currentZ;

        const threshold =
            difficulty === "HARD"
                ? paddle.speed * 0.1
                : difficulty === "MEDIUM"
                  ? paddle.speed * 0.3
                  : paddle.speed * 0.8;

        if (difficulty === "EASY" && Math.random() < 0.01) {
            return "stop";
        }

        if (Math.abs(difference) <= threshold) {
            return "stop";
        }

        return difference > 0 ? "up" : "down";
    };

    const predictBallPosition = (
        snapshot: GameSnapshot,
        config: AIConfig
    ): { position: number; confidence: number } => {
        const { ball, paddle, boardSize } = snapshot;

        let simBall = {
            pos: { ...ball.pos },
            vec: { ...ball.vec },
            r: ball.r,
        };

        const wallLimit = boardSize.depth / 2 - simBall.r;
        const targetX = paddle.pos.x;

        let bounceCount = 0;
        let confidence = 1.0;
        const maxSteps = difficulty === "HARD" ? 600 : difficulty === "MEDIUM" ? 500 : 250; // Much higher simulation steps
        let steps = 0;

        // Simulate ball movement using actual game physics (direct movement per frame)
        while (steps < maxSteps && bounceCount < config.maxDepth) {
            steps++;

            const distanceToTarget = Math.abs(simBall.pos.x - targetX);
            if (distanceToTarget < paddle.size.width) {
                break;
            }

            simBall.pos.x += simBall.vec.x;
            simBall.pos.z += simBall.vec.z;

            // Wall collision detection (matches game engine logic)
            if (Math.abs(simBall.pos.z) > wallLimit) {
                simBall.vec.z *= -1;
                simBall.pos.z = Math.sign(simBall.pos.z) * wallLimit;
                bounceCount++;
                // Better confidence retention for MEDIUM and HARD
                confidence *= difficulty === "HARD" ? 0.995 : difficulty === "MEDIUM" ? 0.99 : 0.92;
            }
        }

        const distanceFactor = Math.abs(ball.pos.x - targetX) / boardSize.width;
        confidence *= 1 - distanceFactor * 0.2;

        return {
            position: simBall.pos.z,
            confidence: confidence,
        };
    };

    const tacticalAdjustment = () => {
        if (!gameSnapshot) return;

        const currentZ = gameSnapshot.paddle.pos.z;
        const difference = strategicTarget - currentZ;

        const threshold =
            difficulty === "HARD"
                ? gameSnapshot.paddle.speed * 0.05
                : difficulty === "MEDIUM"
                  ? gameSnapshot.paddle.speed * 0.1
                  : gameSnapshot.paddle.speed * 0.2;

        let newInput: UserInput = "stop";
        if (Math.abs(difference) > threshold) {
            newInput = difference > 0 ? "up" : "down";

            if (difficulty === "EASY" && Math.random() < 0.02) {
                newInput = "stop";
            }
        }

        if (newInput !== currentInput) {
            currentInput = newInput;
            engine.setInput(playerIndex, currentInput);
        }
    };

    setTimeout(makeDecision, 10);

    return aiPlayer;
};
