// Shared from backend, change to pulling from private registry later?

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
};

export type UserInput = "up" | "down" | "stop";

// Unify with remote later, this is ugh
export type LocalUserInput = "0-up" | "0-down" | "0-stop" | "1-up" | "1-down" | "1-stop";

export type PongType = "local" | "remote";

// Maybe add waiting, paused
export type PongStatus = "ongoing" | "ended";

// Maybe add start, pause, resume, end
export type PongEventType = "wall-collision" | "paddle-collision" | "score";

export type PongEvent = {
    type: PongEventType;
    timestamp: number;
};

export type PongState = {
    status: PongStatus;
    scores: [number, number];
    ball: Ball;
    paddles: [Paddle, Paddle];
    events: PongEvent[];
};
