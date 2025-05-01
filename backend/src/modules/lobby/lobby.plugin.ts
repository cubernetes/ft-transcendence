import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createLobbyController } from "./lobby.controller.ts";
import { createLobbyService } from "./lobby.service.ts";

const lobbyPlugin = async (app: FastifyInstance) => {
    app.decorate("lobbyService", createLobbyService(app));
    const controller = createLobbyController(app);

    app.wsService.registerHandler("lobby-create", controller.create);
    app.wsService.registerHandler("lobby-join", controller.join);
    app.wsService.registerHandler("lobby-update-config", controller.updateConfig);
    app.wsService.registerHandler("lobby-leave", controller.leave);
};

export default fp(lobbyPlugin, {
    name: "lobby-plugin",
    dependencies: ["db-plugin", "auth-plugin"], // TODO: ensure dependencies are correct
});
