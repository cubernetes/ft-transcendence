import { PongEngine, Position3D, Size3D, UserInput, Vector3D } from "../pong/pong.types";
import { AIConfig, AIDifficulty, AIPlayer } from "./ai.types";

const AI_UPDATE_INTERVAL = 1000;

const DIFFICULTY_LEVELS: Record<AIDifficulty, AIConfig> = {
    EASY: {
        maxDepth: 2, // predicts 2 bounces ahead
        reactionSpeedMultiplier: 0.4,
        randomnessFactor: 0.4,
    },
    MEDIUM: {
        maxDepth: 4, // predicts 4 bounces ahead
        reactionSpeedMultiplier: 0.7,
        randomnessFactor: 0.2,
    },
    HARD: {
        maxDepth: 8, // Predicts up to 8 bounces ahead
        reactionSpeedMultiplier: 1.0,
        randomnessFactor: 0.05,
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

interface PredictionResult {
    finalBallZ: number;
    confidence: number;
    timeToReach: number;
    interceptable: boolean;
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

    // Store the last few game states for pattern recognition
    const stateHistory: GameSnapshot[] = [];
    const playerMovementHistory: UserInput[] = [];
    const MAX_HISTORY = 7;
    const MAX_MOVEMENT_HISTORY = 5;

    const aiPlayer: AIPlayer = {
        playerIndex,
        lastUpdateTime: Date.now(),
        engine,
        difficulty,
        isActive: true,
    };

    // Capture game state (but only process once per second)
    engine.onEvent("state-update", (evt) => {
        if (!aiPlayer.isActive) return;

        const { ball, paddles } = evt.state;
        const paddle = paddles[playerIndex];

        // Get the current game configuration dynamically
        const config = engine.getConfig();

        gameSnapshot = {
            ball: { ...ball },
            paddle: { ...paddle },
            boardSize: { ...config.board.size }, // Dynamic board size from config
            timestamp: Date.now(),
        };

        // Maintain state history for pattern recognition
        stateHistory.push({ ...gameSnapshot });
        if (stateHistory.length > MAX_HISTORY) {
            stateHistory.shift();
        }

        // Track opponent paddle movement patterns (if we have enough history)
        if (stateHistory.length >= 2) {
            const previousPaddle = stateHistory[stateHistory.length - 2].paddle;
            const currentPaddle = gameSnapshot.paddle;

            // Determine opponent's movement
            let opponentMove: UserInput = "stop";
            const paddleDiff = currentPaddle.pos.z - previousPaddle.pos.z;

            if (Math.abs(paddleDiff) > 0.05) {
                opponentMove = paddleDiff > 0 ? "up" : "down";
            }

            // Store opponent movement pattern
            playerMovementHistory.push(opponentMove);
            if (playerMovementHistory.length > MAX_MOVEMENT_HISTORY) {
                playerMovementHistory.shift();
            }
        }
    });

    // Main AI decision loop
    const makeDecision = (): void => {
        if (!aiPlayer.isActive || !gameSnapshot) return;

        const now = Date.now();
        if (now - lastDecisionTime < AI_UPDATE_INTERVAL) {
            return;
        }
        lastDecisionTime = now;

        const prediction = predictBallInterception(gameSnapshot, config);
        const patternAnalysis = detectPlayerPatterns();
        const newInput = makeStrategicDecision(gameSnapshot, prediction, config, patternAnalysis);

        // Only change input if decision is different (simulate human-like behavior)
        if (newInput !== currentInput) {
            currentInput = newInput;

            // Add reaction delay
            const reactionDelay = calculateReactionDelay(config, prediction.confidence);

            setTimeout(() => {
                if (aiPlayer.isActive) {
                    // This simulates keyboard input by calling the engine's input system
                    engine.setInput(playerIndex, currentInput);
                }
            }, reactionDelay);
        }
        setTimeout(makeDecision, AI_UPDATE_INTERVAL);
    };

    const predictBallInterception = (
        snapshot: GameSnapshot,
        config: AIConfig
    ): PredictionResult => {
        const { ball, paddle, boardSize } = snapshot;

        const isMovingTowardUs =
            (playerIndex === 0 && ball.vec.x < 0) || (playerIndex === 1 && ball.vec.x > 0);

        if (!isMovingTowardUs) {
            return {
                finalBallZ: ball.pos.z,
                confidence: 0.1,
                timeToReach: Infinity,
                interceptable: false,
            };
        }

        let simBall = { ...ball };
        let bounceCount = 0;
        let timeElapsed = 0;
        const timeStep = 16; // ~60fps simulation

        const wallLimit = boardSize.depth / 2 - simBall.r;

        // Simulate until ball reaches our paddle's X position or max depth reached
        while (bounceCount < config.maxDepth && timeElapsed < 5000) {
            const distanceToReach = Math.abs(simBall.pos.x - paddle.pos.x);

            if (distanceToReach < 0.5) {
                // Close enough to paddle
                break;
            }

            // Move ball one step
            simBall.pos.x += simBall.vec.x;
            simBall.pos.z += simBall.vec.z;
            timeElapsed += timeStep;

            // Check for wall bounces (top/bottom walls)
            if (Math.abs(simBall.pos.z) > wallLimit) {
                simBall.vec.z *= -1;
                simBall.pos.z = Math.sign(simBall.pos.z) * wallLimit;
                bounceCount++;
            }
        }

        // Calculate confidence based on prediction quality
        const confidence = Math.max(0, 1 - bounceCount * 0.2 - timeElapsed / 5000);
        const interceptable = Math.abs(simBall.pos.z - paddle.pos.z) < paddle.size.depth;

        return {
            finalBallZ: simBall.pos.z,
            confidence,
            timeToReach: timeElapsed,
            interceptable,
        };
    };

    // Make strategic decisions based on game situation and player patterns
    const makeStrategicDecision = (
        snapshot: GameSnapshot,
        prediction: PredictionResult,
        config: AIConfig,
        patternAnalysis: { isRepeating: boolean; predictedMove: UserInput; confidence: number }
    ): UserInput => {
        const { paddle } = snapshot;
        let targetZ = prediction.finalBallZ;
        const currentZ = paddle.pos.z;

        if (patternAnalysis.isRepeating && patternAnalysis.confidence > 0.6) {
            const exploitOffset = calculateExploitOffset(patternAnalysis.predictedMove, config);
            targetZ += exploitOffset;

            if (config.maxDepth >= 4) {
                // Only for MEDIUM/HARD AI
                console.log(
                    `🧠 AI detected pattern: ${patternAnalysis.predictedMove}, exploiting with offset ${exploitOffset}`
                );
            }
        }

        // Add randomness based on difficulty (imperfect play)
        const randomOffset = (Math.random() - 0.5) * 2 * config.randomnessFactor;
        const adjustedTargetZ = targetZ + randomOffset;

        const difference = adjustedTargetZ - currentZ;
        const threshold = 0.2; // Dead zone to prevent jittery movement

        if (!prediction.interceptable || prediction.confidence < 0.3) {
            // Ball is hard to intercept, position defensively in center
            const centerZ = 0;
            const centerDiff = centerZ - currentZ;

            if (Math.abs(centerDiff) < threshold) {
                return "stop";
            }
            return centerDiff > 0 ? "up" : "down";
        }

        // Normal interception behavior
        if (Math.abs(difference) < threshold) {
            return "stop";
        }

        return difference > 0 ? "up" : "down";
    };

    // Calculate reaction delay based on difficulty and prediction confidence
    const calculateReactionDelay = (config: AIConfig, confidence: number): number => {
        const baseDelay = 100;
        const maxDelay = 400;

        const confidenceDelay = (1 - confidence) * 200;
        const difficultyMultiplier = 1 / config.reactionSpeedMultiplier;

        return Math.min(maxDelay, baseDelay + confidenceDelay * difficultyMultiplier);
    };

    // Enhanced pattern recognition for advanced difficulties
    const detectPlayerPatterns = (): {
        isRepeating: boolean;
        predictedMove: UserInput;
        confidence: number;
    } => {
        if (playerMovementHistory.length < 4) {
            return { isRepeating: false, predictedMove: "stop", confidence: 0 };
        }

        // Analyze recent movement patterns
        const recentMoves = playerMovementHistory.slice(-4); // Last 3 moves

        // Alternating movement (up, down, up, down)
        const alternatingPattern = detectAlternatingPattern(recentMoves);
        if (alternatingPattern.confidence > 0.7) {
            return alternatingPattern;
        }

        // Directional bias (player prefers moving up vs down)
        const biasPattern = detectDirectionalBias(playerMovementHistory);
        if (biasPattern.confidence > 0.5) {
            return biasPattern;
        }

        return { isRepeating: false, predictedMove: "stop", confidence: 0 };
    };

    // Helper: Detect alternating up/down pattern
    const detectAlternatingPattern = (
        moves: UserInput[]
    ): { isRepeating: boolean; predictedMove: UserInput; confidence: number } => {
        if (moves.length < 4) return { isRepeating: false, predictedMove: "stop", confidence: 0 };

        let alternations = 0;
        for (let i = 1; i < moves.length; i++) {
            if (
                (moves[i] === "up" && moves[i - 1] === "down") ||
                (moves[i] === "down" && moves[i - 1] === "up")
            ) {
                alternations++;
            }
        }

        const alternationRatio = alternations / (moves.length - 1);
        if (alternationRatio > 0.6) {
            const lastMove = moves[moves.length - 1];
            const predictedMove: UserInput =
                lastMove === "up" ? "down" : lastMove === "down" ? "up" : "stop";
            return {
                isRepeating: true,
                predictedMove,
                confidence: alternationRatio,
            };
        }

        return { isRepeating: false, predictedMove: "stop", confidence: 0 };
    };

    // Helper: Detect directional bias
    const detectDirectionalBias = (
        moves: UserInput[]
    ): { isRepeating: boolean; predictedMove: UserInput; confidence: number } => {
        const upCount = moves.filter((m) => m === "up").length;
        const downCount = moves.filter((m) => m === "down").length;
        const totalDirectionalMoves = upCount + downCount;

        if (totalDirectionalMoves < 3)
            return { isRepeating: false, predictedMove: "stop", confidence: 0 };

        const bias = Math.abs(upCount - downCount) / totalDirectionalMoves;
        if (bias > 0.6) {
            const preferredDirection: UserInput = upCount > downCount ? "up" : "down";
            return {
                isRepeating: true,
                predictedMove: preferredDirection,
                confidence: bias * 0.6, // Lower confidence for bias patterns
            };
        }

        return { isRepeating: false, predictedMove: "stop", confidence: 0 };
    };

    // Calculate how to exploit detected player patterns
    const calculateExploitOffset = (predictedPlayerMove: UserInput, config: AIConfig): number => {
        if (config.maxDepth < 3) return 0; // Only MEDIUM and HARD AI exploit patterns

        const exploitStrength = (config.maxDepth - 2) * 0.3;

        switch (predictedPlayerMove) {
            case "up":
                return -exploitStrength; // Move away from where player is going
            case "down":
                return exploitStrength; // Move away from where player is going
            default:
                return 0;
        }
    };

    // Start the AI decision loop
    setTimeout(makeDecision, AI_UPDATE_INTERVAL);

    return aiPlayer;
};
