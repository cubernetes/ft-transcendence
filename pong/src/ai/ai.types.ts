import { createPongEngine } from "../pong.engine";

export type PongEngine = ReturnType<typeof createPongEngine>;

export type AIDifficulty = "EASY" | "MEDIUM" | "HARD";

export type AIConfig = {
    maxDepth: number;
    reactionSpeedMultiplier: number;
    randomnessFactor: number;
};

export type AIPlayer = {
    playerIndex: number;
    lastUpdateTime: number;
    engine: PongEngine;
    difficulty: AIDifficulty;
    isActive: boolean;
};

export type AIService = {
    createAIPlayer: (engine: PongEngine, playerIndex: number, difficulty?: AIDifficulty) => void;
    removeAIPlayer: (playerIndex: number) => void;
    processAI: (player: AIPlayer) => void;
};
