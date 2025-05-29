import type { PongEngine } from "@darrenkuro/pong-core";

export type LobbyId = string;

export type GameSession = {
    createdAt: string; // Conform to sqlite datetime structure "YYYY-MM-DD HH:MM:SS"
    engine: PongEngine;
    players: number[];
    playerNames: string[];
    playerReady: boolean[];
    timeoutHandler?: NodeJS.Timeout;
};
