import type { PongEngine } from "@darrenkuro/pong-core";
import type { WebSocket } from "fastify";

export type LobbyId = string;

export type GameSession = {
    createdAt: string; // Confirm to sqlite datetime structure "YYYY-MM-DD HH:MM:SS"
    gameId: string; // UUID
    engine: PongEngine;
    players: WebSocket[];
    playerNames: string[];
};
