import type { Message } from "@darrenkuro/pong-core";
import type { FastifyRequest } from "fastify";
import type { WebSocket } from "fastify";

export const handleConnection = async (conn: WebSocket, req: FastifyRequest) => {
    const { server } = req;

    conn.on("message", (message: string) => {
        try {
            const { type, payload } = JSON.parse(message) as Message;

            const handler = server.wsService.messageHandlers[type];

            if (!handler) {
                return server.log.error(`Unknown message type: ${type}`);
            }

            const result = handler(conn, payload);

            if (result.isErr()) {
                return server.log.error({ e: result.error }, "Websocket on message failed");
                // Do you send back error message via websocket?
            }

            result.value.forEach(([conn, msg]) => {
                conn.send(JSON.stringify(msg));
            });
        } catch (e) {
            server.log.error({ e }, "Websocket on message failed"); // This has to be JSON.parse
        }
    });

    conn.on("ping", () => {
        server.log.info("Ping received!");
        conn.pong();
    });

    conn.on("close", () => {
        server.log.info(`WebSocket connection closed for player ${conn.userId}`);
        //server.wsService.removePlayerFromGame(gameId, userId); // Clean up when the player disconnects
    });
};
