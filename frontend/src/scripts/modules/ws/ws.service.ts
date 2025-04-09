import { UserInput } from "@darrenkuro/pong-core";
import { authStore } from "../auth/auth.store";
import { gameStore } from "../game/game.store";
import { createWsController } from "./ws.controller";

// All socket-related will go through this service, so this will be the only reference
let conn: WebSocket | null = null;

export const establishSocketConn = (token: string) => {
    // Maybe use token to do auth over socket here
    conn = new WebSocket("ws");
    createWsController(conn);
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
    const message = JSON.stringify({
        type: "game-start",
        payload: { token },
    });
    window.log.debug(`Sending game-start message: ${message}`);
    conn.send(message);
};

export const sendGameAction = (action: UserInput) => {
    if (!conn || conn.readyState !== WebSocket.OPEN) {
        window.log.error("Socket is null or not open when trying to send game action");
        return;
    }

    const { gameId, index } = gameStore.get();
    const message = JSON.stringify({
        type: "game-action",
        payload: { gameId, index, action },
    });
    window.log.debug(`Sending game-action message: ${message}`);
    conn.send(message);
};
