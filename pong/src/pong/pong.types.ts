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

export type PongConfig = {
    board: { size: Size3D };
    paddles: [Paddle, Paddle];
    ball: Ball;
    playTo: number;
    fps: number;
    resetDelay: number;
};

export type UserInput = "up" | "down" | "stop";

// Maybe add waiting, paused
export type PongStatus = "waiting" | "ongoing" | "ended";

export type PongEngineEventMap = {
    "wall-collision": null;
    "paddle-collision": null;
    "state-update": { state: PongState };
    "score-update": { scores: [number, number] };
    "ball-reset": null;
    "game-start": null;
    "game-end": { winner: 0 | 1 };
};

export type EventCallback<T extends keyof PongEngineEventMap> = (
    event: PongEngineEventMap[T]
) => void;

export type PongState = {
    status: PongStatus;
    scores: [number, number];
    ball: Ball;
    paddles: [Paddle, Paddle];
};

export type PongEngine = ReturnType<typeof createPongEngine>;
