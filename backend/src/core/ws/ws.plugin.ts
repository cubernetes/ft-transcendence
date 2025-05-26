import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import { handleConnection } from "./ws.controller.ts";
import { createWsService } from "./ws.service.ts";

const plugin = async (app: FastifyInstance) => {
    const maxPayload = app.config.wsMaxPayload;
    await app.register(websocket, { options: { maxPayload } });

    app.decorate("wsService", createWsService(app));
    app.get(
        "/ws",
        { preHandler: [app.requireAuth], websocket: true, schema: { hide: true } },
        handleConnection
    );
};

export const wsPlugin = fp(plugin, {
    name: "ws-plugin",
    dependencies: ["auth-plugin"],
});
