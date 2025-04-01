import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { handleGameAction, handleGameStart } from "./game.controller.ts";
import gameRoutes from "./game.routes.ts";
import { createGameService } from "./game.service.ts";

const gamePlugin = async (app: FastifyInstance) => {
    app.decorate("gameService", createGameService(app));

    app.wsService.registerHandler("game-start", handleGameStart(app));
    app.wsService.registerHandler("game-action", handleGameAction(app));

    await app.register(gameRoutes, { prefix: "/game" });
};

export default fp(gamePlugin, {
    name: "game-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
