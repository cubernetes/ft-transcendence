import type {
    IncomingMessage as Message,
    IncomingMessageType as Type,
    UserInput,
} from "@darrenkuro/pong-core";
import { registerControllers } from "./ws.controller";
import { wsStore } from "./ws.store";

const send = (conn: WebSocket, message: Message<Type>) => conn.send(JSON.stringify(message));

export const establishSocketConn = () => {
    const { isConnected } = wsStore.get();
    if (isConnected) return window.log.debug("Fail to open socket: already connected");

    const conn = new WebSocket("ws");
    registerControllers(conn);
    wsStore.update({ isConnected: true, conn });
};

export const closeSocketConn = () => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn) return window.log.debug("Fail to close socket: no open socket");

    conn.close();
    wsStore.update({ isConnected: false, conn: null });
};

export const sendGameStart = () => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn || conn.readyState !== WebSocket.OPEN)
        return window.log.error("Fail to send game-start: socket error");

    window.log.debug(`Sending game-start`);
    send(conn, { type: "game-start", payload: null });
};

export const sendGameAction = (action: UserInput) => {
    const { isConnected, conn } = wsStore.get();
    if (!isConnected || !conn || conn.readyState !== WebSocket.OPEN)
        return window.log.error("Fail to send game-action: socket error");

    window.log.debug(`Sending game-action: ${action}`);
    send(conn, { type: "game-action", payload: { action } });
};
