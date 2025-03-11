import { z } from "zod";
import { tournaments } from "../db/db.schema";
export const createTournamentSchema = z.object({});
export const tournamentIdSchema = z.object({ id: z.coerce.number().int().gt(0) });
export const tournamentNameSchema = z.object({ name: z.string().min(3) });

export type CreateTournamentDTO = z.infer<typeof createTournamentSchema>;
export type TournamentIdDTO = z.infer<typeof tournamentIdSchema>;
export type TournamentNameDTO = z.infer<typeof tournamentNameSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type NewTournament = typeof tournaments.$inferInsert;
