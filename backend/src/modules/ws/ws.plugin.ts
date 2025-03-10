import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { createWsService } from "./ws.service";
import { WebSocket } from "ws";

const wsPlugin = async (fastify: FastifyInstance) => {
    await fastify.register(websocket, { options: { maxPayload: 1048576 } });
    fastify.decorate("wsService", createWsService(fastify));

    fastify.get("/ws", { websocket: true }, (conn: WebSocket, req: FastifyRequest) => {
        req.server.log.info("New WebSocket connection");
        conn.send("Welcome to the game!");

        conn.on("message", (message: string) => {
            fastify.wsService.handleMessage(conn, message);
        });

        conn.on("ping", () => {
            req.server.log.info("Ping received!");
            conn.pong();
        });

        conn.on("close", () => {
            req.server.log.info("WebSocket connection closed");
        });
    });
};

export default fp(wsPlugin, {
    name: "ws-plugin",
});
