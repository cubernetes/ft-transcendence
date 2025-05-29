import { z } from "zod";

export type PublicGame = z.infer<typeof publicGame>;
const publicGame = z.strictObject({
    id: z.number(),
    player1Username: z.string(),
    player2Username: z.string(),
    winnerIndex: z.literal(0).or(z.literal(1)),
    player1Hits: z.number(),
    player2Hits: z.number(),
    player1Score: z.number(),
    player2Score: z.number(),
    createdAt: z.string().datetime(),
    finishedAt: z.string().datetime(),
});

export const gameSchema = {
    publicGame,
};
