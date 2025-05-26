import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createGameController } from "./game.controller.ts";
import { createGameService } from "./game.service.ts";

const plugin = async (app: FastifyInstance) => {
    app.decorate("gameService", createGameService(app));

    const controller = createGameController(app);

    app.wsService.registerHandler("game-start", controller.start);
    app.wsService.registerHandler("game-action", controller.action);
    app.wsService.registerHandler("renderer-ready", controller.ready);
};

export const gamePlugin = fp(plugin, {
    name: "game-plugin",
    dependencies: ["db-plugin", "ws-plugin"],
});
