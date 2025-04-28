import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import cookies from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import authPlugin from "./auth/auth.plugin.ts";
import configPlugin from "./config/config.plugin.ts";
import dbPlugin from "./db/db.plugin.ts";
import wsPlugin from "./ws/ws.plugin.ts";

const corePlugin = async (app: FastifyInstance) => {
    // Register configs, check integrity of the env variables
    await app.register(configPlugin);

    await app.register(cors, { origin: app.config.corsOrigin });

    // Register jwt plugin
    await app.register(jwt, {
        secret: app.config.jwtSecret,
        cookie: {
            cookieName: app.config.cookieName,
            signed: false,
        },
    });

    await app.register(cookies);
    await app.register(dbPlugin);
    await app.register(authPlugin);
    await app.register(wsPlugin);
};

export default fp(corePlugin, { name: "core-plugin" });
