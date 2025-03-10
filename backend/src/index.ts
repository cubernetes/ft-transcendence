import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastify, { FastifyInstance } from "fastify";
import dbPlugin from "./modules/db/db.plugin";
import wsPlugin from "./modules/ws/ws.plugin";
import authPlugin from "./modules/auth/auth.plugin";
import userPlugin from "./modules/user/user.plugin";
import gamePlugin from "./modules/game/game.plugin";
import tournamentPlugin from "./modules/tournament/tournament.plugin";
import { seed } from "./modules/db/db.seed";
import { config } from "./config";

let app: FastifyInstance | null = null;

try {
    // Check config integrity
    if (!config.jwtSecret) throw new Error(`JWT_SECRET environment variable is required`);

    app = fastify(config.opts);

    // CORS
    // TODO: When in production what should the origin be? SITES? are env vars loaded?
    await app.register(cors, { origin: config.isDev ? "*" : "placeholder" });

    // TODO: Add more options here for JWT, see: https://github.com/fastify/fastify-jwt
    await app.register(jwt, { secret: config.jwtSecret }); // Register jwt plugin

    await app.register(dbPlugin); // Register database plugin
    await app.register(wsPlugin); // Register websocket plugin
    await app.register(authPlugin); // Register auth plugin
    await app.register(userPlugin); // Register user plugin
    await app.register(gamePlugin); // Register game plugin
    await app.register(tournamentPlugin); // Register tournament plugin

    // Seed database in dev mode
    if (config.isDev) await seed(app);

    // Start server
    await app.listen({ port: config.port, host: "0.0.0.0" });
    app.log.info(`Server running at port ${config.port}!`);
} catch (error) {
    console.error(`Failed to start server: `, error);

    // Safely close the server, trigger all onClose hooks
    if (app) app.close();

    process.exit(1);
}
