import type { IncomingMessage, IncomingMessageType, UserInput } from "@darrenkuro/pong-core";
import { authStore } from "../auth/auth.store";
import { gameStore } from "../game/game.store";
import { registerControllers } from "./ws.controller";
import { wsStore } from "./ws.store";

const send = (conn: WebSocket, message: IncomingMessage<IncomingMessageType>) => {
    conn.send(JSON.stringify(message));
};

export const establishSocketConn = () => {
    // Maybe use token to do auth over socket here
    const { isConnected } = wsStore.get();
    if (isConnected) {
        window.log.debug("Socket is already connected");
        return;
    }

    const conn = new WebSocket("ws");
    registerControllers(conn);
    wsStore.update({ isConnected: true, conn });
};

export const closeSocketConn = () => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn) {
        window.log.debug("Socket is already not connected");
        return;
    }

    conn.close();
    wsStore.update({ isConnected: false, conn: null });
};

export const sendGameStart = () => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn || conn.readyState !== WebSocket.OPEN) {
        window.log.error("SendGameStart but socket is not connected");
        return;
    }

    window.log.debug(`Sending game-start`);
    send(conn, { type: "game-start", payload: null });
};

export const sendGameAction = (action: UserInput) => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn || conn.readyState !== WebSocket.OPEN) {
        window.log.error("SendGameStart but socket is not connected");
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
