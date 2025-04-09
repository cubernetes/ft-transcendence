import { IncomingMessage, IncomingMessageType, UserInput } from "@darrenkuro/pong-core";
import { authStore } from "../auth/auth.store";
import { gameStore } from "../game/game.store";
import { registerControllers } from "./ws.controller";

// All socket-related will go through this service, so this will be the only reference
let conn: WebSocket | null = null;

const send = (conn: WebSocket, message: IncomingMessage<IncomingMessageType>) => {
    conn.send(JSON.stringify(message));
};

export const establishSocketConn = (token: string) => {
    // Maybe use token to do auth over socket here
    conn = new WebSocket("ws");
    registerControllers(conn);
};

export const closeSocketConn = () => {
    if (conn) {
        conn.close();
        conn = null;
    }
};

export const sendGameStart = () => {
    if (!conn || conn.readyState !== WebSocket.OPEN) {
        window.log.error("Socket is null or not open when trying to send game start");
        return;
    }

    const { token } = authStore.get();
    if (!token) {
        window.log.error("Token is null when trying to send game start");
        return;
    }

    window.log.debug(`Sending game-start`);
    send(conn, { type: "game-start", payload: { token } });
};

export const sendGameAction = (action: UserInput) => {
    if (!conn || conn.readyState !== WebSocket.OPEN) {
        window.log.error("Socket is null or not open when trying to send game action");
        return;
    }

    const { gameId, index } = gameStore.get();
    if (!gameId || index === null) {
        window.log.error("Game id or index is null when trying to send game action");
        return;
    }

    window.log.debug(`Sending game-action game ${gameId}, player ${index}: ${action}`);
    send(conn, { type: "game-action", payload: { gameId, index, action } });
};
