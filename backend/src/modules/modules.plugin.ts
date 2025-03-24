import fp from "fastify-plugin";
import authPlugin from "./auth/auth.plugin.ts";
import userPlugin from "./user/user.plugin.ts";
import gamePlugin from "./game/game.plugin.ts";
import tournamentPlugin from "./tournament/tournament.plugin.ts";
// import friendPlugin from "./friend/friend.plugin";
import type { FastifyInstance } from "fastify";

const modulesPlugin = async (fastify: FastifyInstance) => {
    await fastify.register(authPlugin);
    await fastify.register(userPlugin);
    await fastify.register(gamePlugin);
    await fastify.register(tournamentPlugin);
};

export default fp(modulesPlugin, {
    name: "modules-plugin",
});
