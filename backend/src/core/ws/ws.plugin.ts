import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import { handleConnection } from "./ws.controller.ts";
import { createWsService } from "./ws.service.ts";

const wsPlugin = async (app: FastifyInstance) => {
    await app.register(websocket, { options: { maxPayload: 1048576 } });
    app.decorate("wsService", createWsService(app));

    app.get("/ws", { websocket: true, schema: { hide: true } }, handleConnection);
};

export default fp(wsPlugin, {
    name: "ws-plugin",
});
