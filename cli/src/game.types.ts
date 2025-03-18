// Game state received from the server
export interface IServerGameState {
    ballPosition: Vec3D;
    paddlePosition: { [playerId: string]: Vec3D };
    score: Score;
    collisionEvents?: ICollisionEvent[];
}
export interface Vec2D {
    x: number;
    y: number;
}

export interface Vec3D {
    x: number;
    y: number;
    z: number;
}

export interface Score {
	player1: number;
	player2: number;
}

export interface ICollisionEvent {
    type: "paddle" | "wall" | "score";
    timestamp: number;
}

// Local simplified game state for rendering (ASCII)
export interface ICLIGameState {
    score: { player1: number; player2: number };
    ball: Vec2D;
    paddle1: Vec2D;
    paddle2: Vec2D;
    gameRunning: boolean;
    lastCollisionEvents?: ICollisionEvent[];
}

export type Direction = "up" | "down" | "stop";
