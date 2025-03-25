import type { FastifyInstance } from "fastify";
import { createGameService } from "./game.service.ts";
import gameRoutes from "./game.routes.ts";
import fp from "fastify-plugin";

const gamePlugin = async (app: FastifyInstance) => {
    app.decorate("gameService", createGameService(app));

    await app.register(gameRoutes, { prefix: "/game" });
};

export default fp(gamePlugin, {
    name: "game-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
