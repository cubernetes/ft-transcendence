import { IncomingMessage, IncomingMessageType } from "@darrenkuro/pong-core";
import type { FastifyRequest } from "fastify";
import type { WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";

const safeJsonParse = <T>(data: string): Result<T, Error> => {
    try {
        return ok(JSON.parse(data));
    } catch (e) {
        return err(new Error("Invalid JSON"));
    }
};

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const { server } = req;
    server.wsService.addConnection(conn);

    conn.on("message", (raw: string) => {
        const msg = safeJsonParse<IncomingMessage<IncomingMessageType>>(raw.toString());
        if (msg.isErr()) {
            return server.log.error({ e: msg.error }, "Websocket on message failed");
        }

        const handler = server.wsService.handlers.get(msg.value.type);

        if (!handler) {
            return server.log.error(`Unhandled message type: ${msg.value.type}`);
        }

        handler(conn, msg.value.payload);
    });

    conn.on("close", () => {
        server.wsService.removeConnection(conn);
        server.log.info(`WebSocket connection closed for player ${conn.userId}`);
    });
};
