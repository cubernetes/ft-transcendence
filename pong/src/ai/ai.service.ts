import { UserInput } from "../pong/pong.types";
import { AIConfig, AIDifficulty, AIPlayer, AIPongEngine, AIService } from "./ai.types";

// Constants for AI configuration
const AI_UPDATE_INTERVAL = 1000; // Update AI every 1 second
const REACTION_DELAY_MIN = 100; // Minimum reaction delay in ms
const REACTION_DELAY_MAX = 300; // Maximum reaction delay in ms

const DIFFICULTY_LEVELS: Record<AIDifficulty, AIConfig> = {
    EASY: {
        maxDepth: 2,
        reactionSpeedMultiplier: 0.6,
        randomnessFactor: 0.3,
    },
    MEDIUM: {
        maxDepth: 3,
        reactionSpeedMultiplier: 0.8,
        randomnessFactor: 0.15,
    },
    HARD: {
        maxDepth: 4,
        reactionSpeedMultiplier: 1.0,
        randomnessFactor: 0.05,
    },
};

export const createAIService = (): AIService => {
    // Store all active AI players
    const aiPlayers = new Map<number, AIPlayer>();

    const createAIPlayer = (
        engine: AIPongEngine,
        playerIndex: number,
        difficulty: AIDifficulty = "MEDIUM"
    ): void => {
        const aiPlayer: AIPlayer = {
            playerIndex,
            lastUpdateTime: Date.now(),
            engine,
            difficulty,
            isActive: true,
        };

        aiPlayers.set(playerIndex, aiPlayer);
        processAI(aiPlayer);
    };

    const removeAIPlayer = (playerIndex: number): void => {
        const aiPlayer = aiPlayers.get(playerIndex);
        if (aiPlayer) {
            aiPlayer.isActive = false;
            aiPlayers.delete(playerIndex);
        }
    };

    const processAI = (player: AIPlayer): void => {
        if (!player.isActive) return;

        const now = Date.now();
        const timeSinceLastUpdate = now - player.lastUpdateTime;

        if (timeSinceLastUpdate < AI_UPDATE_INTERVAL) {
            setTimeout(() => processAI(player), AI_UPDATE_INTERVAL - timeSinceLastUpdate);
            return;
        }

        const config = DIFFICULTY_LEVELS[player.difficulty];

        // Subscribe to state updates
        player.engine.onEvent("state-update", (event) => {
            if (!player.isActive) return;

            const { ball, paddles } = event.state;
            const paddle = paddles[player.playerIndex];

            // Calculate the ideal position for the paddle
            const idealZ = ball.pos.z;
            const currentZ = paddle.pos.z;
            const diff = idealZ - currentZ;

            // Add some randomness based on difficulty
            const randomFactor = Math.random() * config.randomnessFactor;
            const adjustedDiff = diff * (1 + randomFactor);

            // Determine the move direction
            let move: UserInput = "stop";
            if (Math.abs(adjustedDiff) > 0.1) {
                move = adjustedDiff > 0 ? "up" : "down";
            }

            // Apply the move with reaction delay
            const reactionDelay =
                Math.random() * (REACTION_DELAY_MAX - REACTION_DELAY_MIN) + REACTION_DELAY_MIN;
            setTimeout(() => {
                if (player.isActive) {
                    player.engine.setInput(player.playerIndex, move);
                }
            }, reactionDelay * config.reactionSpeedMultiplier);
        });

        player.lastUpdateTime = now;
        setTimeout(() => processAI(player), AI_UPDATE_INTERVAL);
    };

    return {
        createAIPlayer,
        removeAIPlayer,
        processAI,
    };
};
