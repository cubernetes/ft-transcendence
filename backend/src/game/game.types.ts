import { WebSocket } from "ws";
import GameEngine from "./game.engine";

export type Player = {
    socket: WebSocket;
    playerId: string;
};

export type GameState = {
    ballPosition: { x: number; y: number };
    score: { player1: number; player2: number };
    paddlePosition: { [playerId: string]: { y: number } };
};

export type GameSession = {
    gameId: string;
    players: Map<string, Player>;
    state: GameState;
    loop?: NodeJS.Timeout;      // Store the interval for the game loop
    engine?: GameEngine;        // Store the game engine
};
