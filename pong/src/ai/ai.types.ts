import type { PongEngine } from "../pong/pong.types";

export type AIDifficulty = "EASY" | "MEDIUM" | "HARD";

export type AIPongEngine = Pick<PongEngine, "onEvent" | "setInput" | "getConfig">;

export type AIConfig = {
    maxDepth: number;
    reactionSpeedMultiplier: number;
    randomnessFactor: number;
};

export type AIPlayer = {
    playerIndex: number;
    lastUpdateTime: number;
    engine: AIPongEngine;
    difficulty: AIDifficulty;
    isActive: boolean;
};

export type AIService = {
    createAIPlayer: (
        engine: AIPongEngine,
        playerIndex: number,
        difficulty?: AIDifficulty
    ) => AIPlayer;
};
