import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { lobbyRoutes } from "./lobby.routes.ts";
import { createLobbyService } from "./lobby.service.ts";

const lobbyPlugin = async (app: FastifyInstance) => {
    app.decorate("lobbyService", createLobbyService(app));

    await app.register(lobbyRoutes, { prefix: "/lobby" });
};

export default fp(lobbyPlugin, {
    name: "lobby-plugin",
    dependencies: ["ws-plugin"],
});
