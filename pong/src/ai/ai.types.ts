import { createPongEngine } from "../pong/pong.engine";

export type AIPongEngine = ReturnType<typeof createPongEngine>;

export type AIDifficulty = "EASY" | "MEDIUM" | "HARD";

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
    createAIPlayer: (engine: AIPongEngine, playerIndex: number, difficulty?: AIDifficulty) => void;
    removeAIPlayer: (playerIndex: number) => void;
    processAI: (player: AIPlayer) => void;
};
