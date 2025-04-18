import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
// import friendPlugin from "./friend/friend.plugin";
import gamePlugin from "./game/game.plugin.ts";
//import tournamentPlugin from "./tournament/tournament.plugin.ts";
import userPlugin from "./user/user.plugin.ts";

const modulesPlugin = async (app: FastifyInstance) => {
    // await app.register(friendPlugin);
    await app.register(gamePlugin);
    //await app.register(tournamentPlugin);
    await app.register(userPlugin);
};

export default fp(modulesPlugin, { name: "modules-plugin" });
