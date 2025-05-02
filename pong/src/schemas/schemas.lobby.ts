import { z } from "zod";
import { ApiResponse } from "./schemas.api";

export type CreateBody = z.infer<typeof configBody>;
export type UpdateBody = z.infer<typeof configBody>;
const configBody = z.object({
    config: z.object({
        playTo: z.number().min(1, "Must play to great than 1").max(21, "Must play to less than 21"),
        board: z.object({ width: z.number(), height: z.number(), depth: z.number() }), // TODO: acceptable range
        ball: z.object({ r: z.number() }),
    }),
});

export const lobbySchemas = {};
