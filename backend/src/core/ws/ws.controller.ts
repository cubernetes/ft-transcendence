import type { IncomingMessage, IncomingMessageType } from "@darrenkuro/pong-core";
import type { FastifyRequest } from "fastify";
import type { WebSocket } from "fastify";
import { CLOSING_CODE, safeJsonParse } from "@darrenkuro/pong-core";

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const app = req.server;

    // Prehandler ensures request always has these fields
    conn.userId = Number(req.userId);
    conn.username = req.username;
    conn.userDisplayName = req.userDisplayName;

    app.log.info(`handle socket connection for player ${conn.userId}`);
    app.wsService.addConnection(conn);

    conn.on("message", async (raw: string) => {
        // Try to parse message payload into JSON object
        const msg = await safeJsonParse<IncomingMessage<IncomingMessageType>>(raw.toString());
        if (msg.isErr()) return app.log.error("socket on message failed to parse JSON");

        const { type, payload } = msg.value;
        app.log.debug({ type, payload }, `incoming socket message by user ${conn.userId}`);

        // Try to get handler for the message type
        const handler = app.wsService.getHandler(msg.value.type);
        if (!handler) return app.log.error(`unhandled message type: ${msg.value.type}`);

        handler(conn, msg.value.payload);
    });

    conn.on("close", (code) => {
        app.log.info(`socket connection closed for player ${conn.userId}`);
        app.lobbyService.leave(conn.userId!);

        // Only remove connection if it's not server initiated closing
        if (code !== CLOSING_CODE.MULTI_CLIENT) app.wsService.removeConnection(conn);
    });
};
