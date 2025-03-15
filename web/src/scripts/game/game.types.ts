import { Mesh } from "@babylonjs/core";

// Game state
export interface IBabylonGameState {
    score: { player1: number; player2: number };
    scoreText?: Mesh;
    ball?: Mesh;
    paddle1?: Mesh;
    paddle2?: Mesh;
    fontData: any;
    gameRunning: boolean;
    lastCollisionEvents: ICollisionEvent[];
}

export interface IServerGameState {
    ballPosition: { x: number; y: number; z: number };
    //TODO: playerID should be a number
    paddlePosition: { [playerId: string]: { x: number; y: number; z: number } };
    score?: { player1: number; player2: number };
    collisionEvents?: ICollisionEvent[];
}

export interface ICollisionEvent {
    type: "paddle" | "wall" | "score";
    timestamp: number;
}

export type SoundType = "background" | "bounce" | "hit";
export type Direction = "up" | "down" | "stop";
