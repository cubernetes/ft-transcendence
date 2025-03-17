// Game state received from the server
export interface IServerGameState {
    ballPosition: Vec2D;
    paddlePosition: { [playerId: string]: Vec2D };
    score: { player1: number; player2: number };
    collisionEvents?: ICollisionEvent[];
}

export interface Vec2D {
    x: number;
    y: number;
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
