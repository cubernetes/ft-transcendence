import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { gamePlugin } from "./game/game.plugin.ts";
import { lobbyPlugin } from "./lobby/lobby.plugin.ts";
import { totpPlugin } from "./totp/totp.plugin.ts";
import { userPlugin } from "./user/user.plugin.ts";

const plugin = async (app: FastifyInstance) => {
    await app.register(gamePlugin);
    await app.register(lobbyPlugin);
    await app.register(userPlugin);
    await app.register(totpPlugin);
};

export const modulesPlugin = fp(plugin, { name: "modules-plugin" });
