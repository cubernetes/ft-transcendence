import { z } from "zod";
import { PongConfig } from "./pong.types";

const defaultBoard = {
    size: { width: 20, height: 0.1, depth: 15 },
};
const boardSchema = z.object({
    size: z.object({
        width: z.number(),
        height: z.number(),
        depth: z.number(),
    }),
});

const defaultBall = {
    pos: { x: 0, y: 0.5, z: 0 },
    vec: { x: -0.2, y: 0, z: -0.2 },
    r: 0.21,
    speed: 0.3,
};

const paddleSchema = z.object({
    pos: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
    }),
    size: z.object({
        width: z.number(),
        height: z.number(),
        depth: z.number(),
    }),
    speed: z.number(),
});

const defaultPaddleLeft = {
    pos: { x: -defaultBoard.size.width / 2 + 0.5, y: 0.5, z: 0 },
    size: { width: 0.1, height: 0.3, depth: 2.2 },
    speed: 0.2,
};

const defaultPaddleRight = {
    pos: { x: defaultBoard.size.width / 2 - 0.5, y: 0.5, z: 0 },
    size: { width: 0.1, height: 0.3, depth: 2.2 },
    speed: 0.2,
};

export const defaultGameConfig: PongConfig = {
    board: defaultBoard,
    paddles: [defaultPaddleLeft, defaultPaddleRight],
    ball: defaultBall,
    playTo: 11,
    aiMode: false,
};

export const configSchema = z.object({
    board: boardSchema,
    paddles: paddleSchema.array().length(2),
    aiMode: z.boolean(),
    aiDifficulty: z.string().optional(),
    playTo: z.number().min(1, "Must play to great than 1").max(21, "Must play to less than 21"),
    ball: z.object({ r: z.number() }),
});
