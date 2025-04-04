import { z } from "zod";

export const JwtPayloadSchema = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    iat: z.number(),
    exp: z.number(),
});
