import type { IncomingMessage, IncomingMessageType } from "@darrenkuro/pong-core";
import type { FastifyRequest } from "fastify";
import type { WebSocket } from "fastify";
import { safeJsonParse } from "@darrenkuro/pong-core";

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const { server } = req;

    // Prehandler ensures request always has these fields
    conn.userId = Number(req.userId);
    conn.username = req.username;
    conn.userDisplayName = req.userDisplayName;

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
