import type {
    IncomingMessage as Message,
    IncomingMessageType as Type,
    UserInput,
} from "@darrenkuro/pong-core";
import { gameStore } from "../game/game.store";
import { registerControllers } from "./ws.controller";
import { wsStore } from "./ws.store";

const send = (conn: WebSocket, message: Message<Type>) => {
    log.debug(`Send over socket: ${message}`);

    // TODO: run time schema validation
    conn.send(JSON.stringify(message));
};

export const establishSocketConn = () => {
    const { isConnected } = wsStore.get();
    if (isConnected) return log.debug("Fail to open socket: already connected");

    const conn = new WebSocket("ws");
    registerControllers(conn);
    wsStore.update({ isConnected: true, conn });
};

export const closeSocketConn = () => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn) return log.debug("Fail to close socket: no open socket");

    conn.close();
    wsStore.update({ isConnected: false, conn: null });
};

export const sendGameStart = () => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn || conn.readyState !== WebSocket.OPEN)
        return log.error("Fail to send game-start: socket error");

    log.debug(`Sending game-start`);
    send(conn, { type: "game-start", payload: null });
};

export const sendGameAction = (action: UserInput) => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn || conn.readyState !== WebSocket.OPEN)
        return log.error("Fail to send game-action: socket error");

    log.debug(`Sending game-action: ${action}`);
    send(conn, { type: "game-action", payload: { action } });
};

export const sendRendererReady = () => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn || conn.readyState !== WebSocket.OPEN)
        return log.error("Fail to send renderer-ready: socket error");

    // Don't send if already quit the game
    if (!gameStore.get().isPlaying) return;

    send(conn, { type: "renderer-ready", payload: null });
};
