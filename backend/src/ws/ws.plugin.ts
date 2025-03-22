import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import { createWsService } from "./ws.service.ts";
import { handleConnection } from "./ws.controller.ts";

const wsPlugin = async (fastify: FastifyInstance) => {
    await fastify.register(websocket, { options: { maxPayload: 1048576 } });
    fastify.decorate("wsService", createWsService(fastify));

    fastify.get("/ws", { websocket: true, schema: { hide: true } }, handleConnection);
};

export default fp(wsPlugin, {
    name: "ws-plugin",
});
