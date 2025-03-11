import { z } from "zod";
import { games } from "../db/db.schema";
export const createGameSchema = z.object({});
export const gameIdSchema = z.object({ id: z.coerce.number().int().gt(0) });

export type CreateGameDTO = z.infer<typeof createGameSchema>;
export type GameIdDTO = z.infer<typeof gameIdSchema>;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
