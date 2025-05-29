import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import cookies from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import { apiPlugin } from "./api/api.plugin.ts";
import { authPlugin } from "./auth/auth.plugin.ts";
import { configPlugin } from "./config/config.plugin.ts";
import { dbPlugin } from "./db/db.plugin.ts";
import { wsPlugin } from "./ws/ws.plugin.ts";

const plugin = async (app: FastifyInstance) => {
    // Register configs, check integrity of the env variables
    await app.register(configPlugin);

    const { corsOrigin, jwtSecret, cookieName, uploadMaxSize } = app.config;

    await app.register(cors, { origin: corsOrigin });

    // Register jwt plugin
    await app.register(jwt, { secret: jwtSecret, cookie: { cookieName, signed: false } });

    await app.register(fastifyMultipart, { limits: { fileSize: uploadMaxSize } });
    await app.register(cookies);
    await app.register(dbPlugin);
    await app.register(authPlugin);
    await app.register(wsPlugin);
    await app.register(apiPlugin);
};

export const corePlugin = fp(plugin, { name: "core-plugin" });
