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
    board: Size3D;
    paddles: [Paddle, Paddle];
    ball: Ball;
    playTo: number;
};

export type UserInput = "up" | "down" | "stop";

export type PongType = "local" | "remote";

// Should it have "waiting"? Is "paused" an option to implement?
export type PongStatus = "waiting" | "ongoing" | "paused" | "ended";
