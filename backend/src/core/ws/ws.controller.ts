import type { IncomingMessage, IncomingMessageType } from "@darrenkuro/pong-core";
import type { FastifyRequest } from "fastify";
import type { WebSocket } from "fastify";
import { safeJsonParse } from "@darrenkuro/pong-core";

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const app = req.server;

    // Prehandler ensures request always has these fields
    conn.userId = Number(req.userId);
    conn.username = req.username;
    conn.userDisplayName = req.userDisplayName;

    app.wsService.addConnection(conn);

    conn.on("message", async (raw: string) => {
        // Try to parse message payload into JSON object
        const msg = await safeJsonParse<IncomingMessage<IncomingMessageType>>(raw.toString());
        if (msg.isErr()) return app.log.error("Websocket on message failed to parse JSON");

        // Try to get handler for the message type
        const handler = app.wsService.getHandler(msg.value.type);
        if (!handler) return app.log.error(`Unhandled message type: ${msg.value.type}`);

        handler(conn, msg.value.payload);
    });

    conn.on("close", () => {
        app.wsService.removeConnection(conn);
        app.log.info(`WebSocket connection closed for player ${conn.userId}`);
    });
};
