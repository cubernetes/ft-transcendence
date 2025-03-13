import { WebSocket } from "ws";
import GameEngine from "./game.engine";

export type Player = {
    socket: WebSocket;
    playerId: string;
};

export type CollisionEvent = {
    type: "paddle" | "wall" | "score";
    timestamp: number;
};

export type GameState = {
    ballPosition: { x: number; y: number; z: number };
    score: { player1: number; player2: number };
    paddlePosition: { [playerId: string]: { x: number; y: number; z: number } };
    collisionEvents?: CollisionEvent[];
};

export type GameConstants = {
    BOARD_WIDTH: number;
    BOARD_HEIGHT: number;
    BOARD_DEPTH: number;
    PADDLE_WIDTH: number;
    PADDLE_HEIGHT: number;
    PADDLE_DEPTH: number;
    BALL_RADIUS: number;
    PADDLE_SPEED: number;
    BALL_SPEED: number;
};

export type GameSession = {
    gameId: string;
    players: Map<string, Player>;
    state: GameState;
    loop?: NodeJS.Timeout; // Store the interval for the game loop
    engine?: GameEngine; // Store the game engine
};
