import fp from "fastify-plugin";
import dbPlugin from "./db/db.plugin.ts";
import wsPlugin from "./ws/ws.plugin.ts";
import apiPlugin from "./api/api.plugin.ts";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import configPlugin from "./config/config.plugin.ts";

const corePlugin = async (fastify: FastifyInstance) => {
    /** Register configs, check integrity of the env variables */
    await fastify.register(configPlugin);

    /** Register CORS */
    // TODO: When in production what should the origin be? SITES? are env vars loaded?
    await fastify.register(cors, {
        origin: process.env.NODE_ENV === "production" ? "placeholder" : "*",
    });

    // TODO: Add more options here for JWT, see: https://github.com/fastify/fastify-jwt
    await fastify.register(jwt, { secret: fastify.config.jwtSecret }); // Register jwt plugin

    await fastify.register(dbPlugin);
    await fastify.register(wsPlugin);
    await fastify.register(apiPlugin);
};

export default fp(corePlugin, { name: "core-plugin" });
