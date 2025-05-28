import { PongEngine, Position3D, Size3D, UserInput, Vector3D } from "../pong/pong.types";
import { AIConfig, AIDifficulty, AIPlayer } from "./ai.types";

const AI_UPDATE_INTERVAL = 1000; // AI can only make decisions every 1 second (requirement)

const DIFFICULTY_LEVELS: Record<AIDifficulty, AIConfig> = {
    EASY: {
        maxDepth: 7,
        reactionSpeedMultiplier: 0.6,
        randomnessFactor: 0.2,
    },
    MEDIUM: {
        maxDepth: 10,
        reactionSpeedMultiplier: 0.85,
        randomnessFactor: 0.1,
    },
    HARD: {
        maxDepth: 15,
        reactionSpeedMultiplier: 1.0,
        randomnessFactor: 0.01,
    },
};

interface GameSnapshot {
    ball: { pos: Position3D; vec: Vector3D; r: number };
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

    // Simple adaptation tracking
    let userMovementHistory: UserInput[] = [];
    let consecutiveMisses = 0;
    let currentScores: [number, number] = [0, 0];
    let lastOpponentZ = 0;

    const aiPlayer: AIPlayer = {
        playerIndex,
        lastUpdateTime: Date.now(),
        engine,
        difficulty,
        isActive: true,
    };

    // Capture game state updates
    engine.onEvent("state-update", (evt) => {
        if (!aiPlayer.isActive) return;

        const { ball, paddles } = evt.state;
        const paddle = paddles[playerIndex];
        const gameConfig = engine.getConfig();

        gameSnapshot = {
            ball: { ...ball },
            paddle: { ...paddle },
            boardSize: { ...gameConfig.board.size },
            timestamp: Date.now(),
        };

        // Track opponent movement for adaptation
        const opponentPaddle = paddles[playerIndex === 0 ? 1 : 0];
        const opponentZDiff = opponentPaddle.pos.z - lastOpponentZ;

        let opponentMove: UserInput = "stop";
        if (Math.abs(opponentZDiff) > 0.02) {
            opponentMove = opponentZDiff > 0 ? "up" : "down";
        }

        userMovementHistory.push(opponentMove);
        if (userMovementHistory.length > 5) {
            userMovementHistory.shift();
        }

        lastOpponentZ = opponentPaddle.pos.z;
    });

    // Track score changes for adaptation
    engine.onEvent("score-update", (evt) => {
        const { scores } = evt;
        const prevScores = [...currentScores];
        currentScores = [...scores];

        const opponentIndex = playerIndex === 0 ? 1 : 0;
        if (scores[opponentIndex] > prevScores[opponentIndex]) {
            consecutiveMisses++;
        } else {
            consecutiveMisses = 0;
        }
    });

    // AI decision loop - !! only runs every 1 second as required
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

        const newInput = decideMove(gameSnapshot, config);
        const reactionDelay = 20 + (1 - config.reactionSpeedMultiplier) * 180;

        setTimeout(() => {
            if (aiPlayer.isActive && newInput !== currentInput) {
                currentInput = newInput;
                engine.setInput(playerIndex, currentInput);
            }
        }, reactionDelay);
        setTimeout(makeDecision, AI_UPDATE_INTERVAL);
    };

    const decideMove = (snapshot: GameSnapshot, config: AIConfig): UserInput => {
        const { ball, paddle } = snapshot;
        const currentZ = paddle.pos.z;

        let targetZ: number;

        const isMovingTowardUs =
            (playerIndex === 0 && ball.vec.x < 0) || (playerIndex === 1 && ball.vec.x > 0);

        if (isMovingTowardUs) {
            targetZ = predictBallPosition(snapshot, config);
        } else {
            // Simple tracking when ball is going away
            targetZ = ball.pos.z + ball.vec.z * 2;
        }

        // Adapt based on opponent patterns (requirement: adapt to user interactions)
        const opponentPattern = analyzeOpponentPattern();
        if (opponentPattern.confidence > 0.2) {
            // Anticipate where opponent might hit the ball next
            const anticipationStrength = 0.15 + config.reactionSpeedMultiplier * 0.15; // Scale with difficulty
            const anticipationOffset =
                opponentPattern.tendency === "up"
                    ? -anticipationStrength
                    : opponentPattern.tendency === "down"
                      ? anticipationStrength
                      : 0;
            targetZ += anticipationOffset;
        }

        // Add difficulty-based randomness
        const randomOffset = (Math.random() - 0.5) * 2 * config.randomnessFactor;
        targetZ += randomOffset;

        // If missing frequently, be more aggressive
        if (consecutiveMisses >= 2) {
            const aggressionBonus = (targetZ - currentZ) * 0.3;
            targetZ += aggressionBonus;
        }

        // Calculate movement decision
        const difference = targetZ - currentZ;
        const threshold = 0.04 + config.randomnessFactor * 0.06; // Simplified threshold

        if (Math.abs(difference) <= threshold) {
            return "stop";
        }

        return difference > 0 ? "up" : "down";
    };

    // Analyze opponent movement patterns
    const analyzeOpponentPattern = (): {
        tendency: "up" | "down" | "neutral";
        confidence: number;
    } => {
        if (userMovementHistory.length < 3) {
            return { tendency: "neutral", confidence: 0 };
        }

        const recentMoves = userMovementHistory.slice(-3);
        const upCount = recentMoves.filter((m) => m === "up").length;
        const downCount = recentMoves.filter((m) => m === "down").length;
        const totalMoves = recentMoves.length;

        if (upCount > downCount) {
            return { tendency: "up", confidence: upCount / totalMoves };
        } else if (downCount > upCount) {
            return { tendency: "down", confidence: downCount / totalMoves };
        }

        return { tendency: "neutral", confidence: 0 };
    };

    // Ball position prediction with bounce anticipation
    const predictBallPosition = (snapshot: GameSnapshot, config: AIConfig): number => {
        const { ball, paddle, boardSize } = snapshot;

        let simBall = {
            pos: { ...ball.pos },
            vec: { ...ball.vec },
            r: ball.r,
        };
        let bounceCount = 0;
        const maxBounces = config.maxDepth;
        const wallLimit = boardSize.depth / 2 - simBall.r;
        const paddleX = paddle.pos.x;

        // Simulate ball trajectory
        let steps = 0;
        const maxSteps = 150;

        while (bounceCount < maxBounces && steps < maxSteps) {
            steps++;

            // Check if ball reached paddle area
            if (Math.abs(simBall.pos.x - paddleX) < 0.8) {
                break;
            }

            const timeStep = 0.05;

            // Move ball forward
            simBall.pos.x += simBall.vec.x * timeStep;
            simBall.pos.z += simBall.vec.z * timeStep;

            // Handle wall bounces
            if (Math.abs(simBall.pos.z) > wallLimit) {
                simBall.vec.z *= -1;
                simBall.pos.z = Math.sign(simBall.pos.z) * wallLimit;
                bounceCount++;
            }
        }

        return simBall.pos.z;
    };

    // Start the AI decision loop
    setTimeout(makeDecision, 0);

    return aiPlayer;
};
