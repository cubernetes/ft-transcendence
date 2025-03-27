export type PongConfig = {
    boardWidth: number;
    boardHeight: number;
    boardDepth: number;
    paddleWidth: number;
    paddleHeight: number;
    paddleDepth: number;
    ballRadius: number;
    paddleSpeed: number;
    ballSpeed: number;
    playTo: number;
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
    v: Vector3D;
};

export type UserInput = "up" | "down" | "stop";

export type PongType = "local" | "remote";

// Should it have "waiting"? Is "paused" an option to implement?
export type PongStatus = "waiting" | "ongoing" | "paused" | "ended";
