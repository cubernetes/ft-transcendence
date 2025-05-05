import { z } from "zod";

// export type CreateBody = z.infer<typeof configBody>;
// const configBody = z.object({
//     config: z.object({
//         playTo: z.number().min(1, "Must play to great than 1").max(21, "Must play to less than 21"),
//         board: z.object({ width: z.number(), height: z.number(), depth: z.number() }), // TODO: acceptable range
//         ball: z.object({ r: z.number() }),
//     }),
// });
export type CreatePayload = z.infer<typeof createPayload>;
const createPayload = z.object({ lobbyId: z.string().length(6) });

export type JoinParams = z.infer<typeof joinParams>;
const joinParams = z.object({ lobbyId: z.string().length(6) });

export type UpdateBody = z.infer<typeof updateBody>;
const updateBody = z.object({ playTo: z.number().min(1).max(21) });

export const lobbySchemas = { createPayload, joinParams, updateBody };
