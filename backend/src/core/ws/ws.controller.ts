import type { FastifyRequest } from "fastify";
import type { WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import { IncomingMessage, IncomingMessageType } from "@darrenkuro/pong-core";

const safeJsonParse = <T>(data: string): Result<T, Error> => {
    try {
        return ok(JSON.parse(data));
    } catch (error) {
        return err(new Error("Invalid JSON"));
    }
};

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const { server } = req;
    server.wsService.addConnection(conn);

    conn.on("message", (raw: string) => {
        const msg = safeJsonParse<IncomingMessage<IncomingMessageType>>(raw.toString());
        if (msg.isErr()) {
            return server.log.error("Websocket on message failed to parse JSON");
        }

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
