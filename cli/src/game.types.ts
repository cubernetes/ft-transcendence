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

export interface FieldConfig {
    scaleX: number;
    scaleY: number;
    paddleHeight: number;
}

export interface GameConfig {
    BOARD_WIDTH: number;
    BOARD_HEIGHT: number;
    BOARD_DEPTH: number;
    PADDLE_WIDTH: number;
    PADDLE_HEIGHT: number;
    PADDLE_DEPTH: number;
    BALL_RADIUS: number;
    PADDLE_SPEED: number;
    BALL_SPEED: number;
}
// Fetched game config: {
// 	BOARD_WIDTH: 20, --->
// 	BOARD_HEIGHT: 0.1,
// 	BOARD_DEPTH: 15, --->
// 	PADDLE_WIDTH: 0.2, (--->)
// 	PADDLE_HEIGHT: 0.3,
// 	PADDLE_DEPTH: 5, --->
// 	BALL_RADIUS: 0.3,
// 	PADDLE_SPEED: 0.3,
// 	BALL_SPEED: 0.2

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
