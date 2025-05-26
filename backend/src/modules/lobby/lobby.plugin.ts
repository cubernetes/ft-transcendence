import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { lobbyRoutes } from "./lobby.routes.ts";
import { createLobbyService } from "./lobby.service.ts";

const plugin = async (app: FastifyInstance) => {
    app.decorate("lobbyService", createLobbyService(app));

    await app.register(lobbyRoutes, { prefix: "/lobby" });
};

export const lobbyPlugin = fp(plugin, {
    name: "lobby-plugin",
    dependencies: ["ws-plugin"],
});
