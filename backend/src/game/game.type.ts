import { z } from "zod";
import { games } from "../db/db.schema.ts";
export const createGameSchema = z.object({});
export const gameIdSchema = z.object({ id: z.coerce.number().int().gt(0) });
import { WebSocket } from "ws";
import GameEngine from "./game.engine.ts";

export type CreateGameDTO = z.infer<typeof createGameSchema>;
export type GameIdDTO = z.infer<typeof gameIdSchema>;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

// Temporary types
export type Player = {
    socket: WebSocket;
    playerId: string;
};

export type GameState = {
    ballPosition: { x: number; y: number };
    score: { player1: number; player2: number };
    paddlePosition: { [playerId: string]: { y: number } };
};

export type GameSession = {
    gameId: string;
    players: Map<string, Player>;
    state: GameState;
    loop?: NodeJS.Timeout; // Store the interval for the game loop
    engine?: GameEngine; // Store the game engine
};
