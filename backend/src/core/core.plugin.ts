import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import apiPlugin from "./api/api.plugin.ts";
import authPlugin from "./auth/auth.plugin.ts";
import configPlugin from "./config/config.plugin.ts";
import dbPlugin from "./db/db.plugin.ts";
import wsPlugin from "./ws/ws.plugin.ts";

const corePlugin = async (app: FastifyInstance) => {
    // Register configs, check integrity of the env variables
    await app.register(configPlugin);

    await app.register(cors, { origin: app.config.corsOrigin });

    // TODO: Add more options here for JWT, see: https://github.com/fastify/fastify-jwt
    await app.register(jwt, { secret: app.config.jwtSecret }); // Register jwt plugin

    await app.register(dbPlugin);
    await app.register(authPlugin);
    await app.register(wsPlugin);
    await app.register(apiPlugin);
};

export default fp(corePlugin, { name: "core-plugin" });
