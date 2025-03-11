import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastify, { FastifyInstance } from "fastify";
import dbPlugin from "./db/db.plugin";
import wsPlugin from "./ws/ws.plugin";
import authPlugin from "./auth/auth.plugin";
import userPlugin from "./user/user.plugin";
import gamePlugin from "./game/game.plugin";
import tournamentPlugin from "./tournament/tournament.plugin";
import { seed } from "./db/db.seed";
import configPlugin, { appOpts } from "./config";

let app: FastifyInstance | null = null;

try {
    app = fastify(appOpts);

    /** Register configs, check integrity of the env variables */
    await app.register(configPlugin);

    // CORS
    // TODO: When in production what should the origin be? SITES? are env vars loaded?
    await app.register(cors, { origin: app.config.isProd ? "placeholder" : "*" });

    // TODO: Add more options here for JWT, see: https://github.com/fastify/fastify-jwt
    await app.register(jwt, { secret: app.config.jwtSecret }); // Register jwt plugin

    await app.register(dbPlugin); // Register database plugin
    await app.register(wsPlugin); // Register websocket plugin
    await app.register(authPlugin); // Register auth plugin
    await app.register(userPlugin); // Register user plugin
    await app.register(gamePlugin); // Register game plugin
    await app.register(tournamentPlugin); // Register tournament plugin

    // Seed database if not in production
    if (!app.config.isProd) await seed(app);

    // Start server
    await app.listen({ port: app.config.port, host: "0.0.0.0" });
    app.log.info(`Server running at port ${app.config.port}!`);
} catch (error) {
    if (!app) {
        console.error("Fastify instance not initialized, likely due to config error!");
        process.exit(1);
    }

    app.log.error({ err: error }, "Failed to start server");
    // Safely close the server, trigger all onClose hooks
    app.close();

    process.exit(1);
}
