import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createGameController } from "./game.controller.ts";
import { createGameService } from "./game.service.ts";

const plugin = async (app: FastifyInstance) => {
    app.decorate("gameService", createGameService(app));

    const { start, action, ready } = createGameController(app);

    app.wsService.registerHandler("game-start", start);
    app.wsService.registerHandler("game-action", action);
    app.wsService.registerHandler("renderer-ready", ready);
};

export const gamePlugin = fp(plugin, {
    name: "game-plugin",
    dependencies: ["db-plugin", "ws-plugin"],
});
