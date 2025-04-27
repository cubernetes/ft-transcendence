import type { WebSocket } from "fastify";
import { z } from "zod";
import { createPongEngine } from "@darrenkuro/pong-core";
import { games } from "../../core/db/db.schema.ts";

export const createGameSchema = z.object({});
export const gameIdSchema = z.object({ id: z.coerce.number().int().gt(0) });

export type GameId = string;
export type PongEngine = ReturnType<typeof createPongEngine>;

export type CreateGameDTO = z.infer<typeof createGameSchema>;
export type GameIdDTO = z.infer<typeof gameIdSchema>;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type GameSession = {
    engine: PongEngine;
    players: WebSocket[];
    createdAt: string; // Confirm to sqlite datetime structure "YYYY-MM-DD HH:MM:SS"
};
