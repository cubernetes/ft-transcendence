import type { FastifyInstance } from "fastify";
import { createGameService } from "./game.service.ts";
import gameRoutes from "./game.routes.ts";
import fp from "fastify-plugin";

const gamePlugin = async (fastify: FastifyInstance) => {
    fastify.decorate("gameService", createGameService(fastify));

    await fastify.register(gameRoutes, { prefix: "/games" });
};

export default fp(gamePlugin, {
    name: "game-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
