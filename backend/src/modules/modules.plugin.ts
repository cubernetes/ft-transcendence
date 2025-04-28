import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
// import friendPlugin from "./friend/friend.plugin";
import gamePlugin from "./game/game.plugin.ts";
import swaggerPlugin from "./swagger/swagger.plugin.ts";
import totpPlugin from "./totp/totp.plugin.ts";
import userPlugin from "./user/user.plugin.ts";

const modulesPlugin = async (app: FastifyInstance) => {
    // await app.register(friendPlugin);
    await app.register(gamePlugin);
    await app.register(userPlugin);
    await app.register(totpPlugin);

    // Register swagger and swagger-ui if not in production
    if (process.env.NODE_ENV !== "production") {
        await app.register(swaggerPlugin);
    }
};

export default fp(modulesPlugin, { name: "modules-plugin" });
