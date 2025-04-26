import type { IncomingMessage, IncomingMessageType } from "@darrenkuro/pong-core";
import type { FastifyRequest } from "fastify";
import type { WebSocket } from "fastify";
import { safeJsonParse } from "@darrenkuro/pong-core";

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const { server } = req;

    // Authentication
    const token = req.cookies[req.server.config.cookieName];
    const user = server.authService.verifyToken(token ?? "");
    if (!token || user.isErr()) {
        conn.close();
        return server.log.error("Client contains no valid token");
    }

    conn.userId = Number(user.value.id);
    conn.userDisplayName = user.value.displayName;

    server.wsService.addConnection(conn);

    conn.on("message", (raw: string) => {
        const msg = safeJsonParse<IncomingMessage<IncomingMessageType>>(raw.toString());
        if (msg.isErr()) {
            return server.log.error("Websocket on message failed to parse JSON");
        }

        server.log.debug(msg.value.type);
        const handler = server.wsService.getHandler(msg.value.type);

        if (handler.isErr()) {
            return server.log.error(`Unhandled message type: ${msg.value.type}`);
        }

        handler.value(conn, msg.value.payload);
    });

    conn.on("close", () => {
        server.wsService.removeConnection(conn);
        server.log.info(`WebSocket connection closed for player ${conn.userId}`);
    });
};
