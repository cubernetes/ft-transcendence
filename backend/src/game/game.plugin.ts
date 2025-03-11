import type { FastifyInstance } from "fastify";
import { createGameService } from "./game.service";
import gameRoutes from "./game.routes";
import fp from "fastify-plugin";

const gamePlugin = async (fastify: FastifyInstance) => {
    fastify.decorate("gameService", createGameService(fastify));

    await fastify.register(gameRoutes, { prefix: "/games" });
};

export default fp(gamePlugin, {
    name: "game-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
