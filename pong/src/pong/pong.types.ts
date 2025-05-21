import type { AIDifficulty } from "../ai/ai.types";
import { z } from "zod";
import { createPongEngine } from "./pong.engine";

export type Size3D = {
    width: number;
    height: number;
    depth: number;
};

export type Position3D = {
    x: number;
    y: number;
    z: number;
};

export type Vector3D = {
    x: number;
    y: number;
    z: number;
};

export type Ball = {
    pos: Position3D;
    vec: Vector3D;
    r: number;
    speed: number;
};

export type Paddle = {
    pos: Position3D;
    size: Size3D;
    speed: number;
};

export type UserInput = z.infer<typeof UserInputSchema>;
export const UserInputSchema = z.enum(["up", "down", "stop"]);

export type GameMode = "local" | "online" | "ai" | "tournament";

export type Status = "waiting" | "paused" | "ongoing" | "ended" | "rendering";

export type EventMap = {
    "wall-collision": null;
    "paddle-collision": null;
    "state-update": { state: State };
    "score-update": { scores: [number, number] };
    "game-end": {
        winner: 0 | 1;
        hits: [number, number];
        state: State;
    };
};

export type EventCb<T extends keyof EventMap> = (evt: EventMap[T]) => void;

export type State = {
    status: Status;
    scores: [number, number];
    ball: Ball;
    paddles: [Paddle, Paddle];
};
export type PongState = State; // Deprecrated

export type PongConfig = {
    board: { size: Size3D };
    paddles: [Paddle, Paddle];
    ball: Ball;
    playTo: number;
    aiMode: boolean;
    aiDifficulty?: AIDifficulty;
};

export type PongEngine = ReturnType<typeof createPongEngine>;
