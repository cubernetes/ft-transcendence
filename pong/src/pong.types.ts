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
};

export type UserInput = "up" | "down" | "stop";

// Maybe add waiting, paused
export type PongStatus = "waiting" | "ongoing" | "ended";

// Maybe add start, pause, resume, end, error??
export type PongEngineEvent =
    | { type: "wall-collision" }
    | { type: "paddle-collision" }
    | { type: "stateUpdate"; state: PongState }
    | { type: "game-end"; winner: number }
    | { type: "score"; scores: [number, number] }
    | { type: "ball-reset" };

export type PongState = {
    status: PongStatus;
    scores: [number, number];
    ball: Ball;
    paddles: [Paddle, Paddle];
};
