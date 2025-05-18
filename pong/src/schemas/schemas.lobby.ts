import { z } from "zod";

export type CreatePayload = z.infer<typeof createPayload>;
const createPayload = z.object({ lobbyId: z.string().length(6) });

export type JoinParams = z.infer<typeof joinParams>;
const joinParams = z.object({ lobbyId: z.string().length(6) });

export type UpdateBody = z.infer<typeof updateBody>;
const updateBody = z.object({ playTo: z.number().min(1).max(21) });

export const lobbySchemas = { createPayload, joinParams, updateBody };
