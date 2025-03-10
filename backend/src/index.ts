import { drizzle } from "drizzle-orm/better-sqlite3";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { createUserService } from "./modules/user/user.service";
import { createAuthService } from "./modules/auth/auth.service";
import userRoutes from "./modules/user/user.routes";
import fastify, { FastifyInstance } from "fastify";
import dbPlugin from "./modules/db/db.plugin";
import userPlugin from "./modules/user/user.plugin";
import authPlugin from "./modules/auth/auth.plugin";
import { FastifyServerOptions } from "fastify";
import { PinoLoggerOptions } from "fastify/types/logger";
import { createWsService } from "./modules/ws/ws.service";
import wsPlugin from "./modules/ws/ws.plugin";
import { seed } from "./modules/db/db.seed";

// Declare the decorated plugins
declare module "fastify" {
    interface FastifyInstance {
        db: ReturnType<typeof drizzle>;
        wsService: ReturnType<typeof createWsService>;
        userService: ReturnType<typeof createUserService>;
        userRoutes: ReturnType<typeof userRoutes>;
        authService: ReturnType<typeof createAuthService>;
    }
}

/** Configs, temporarily here */
const isDev = process.env.NODE_ENV === "development";

export const devLoggerConfig: PinoLoggerOptions = {
    level: "debug", // More detailed logs in dev
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true, // Enables colors for better readability
            translateTime: "HH:MM:ss Z", // Formats timestamps
            ignore: "pid,hostname", // Hides unnecessary fields
        },
    },
    serializers: {
        err: (error) => ({
            type: error.name,
            message: error.message,
            stack: error.stack || "No stack trace available",
        }),
    },
};

export const prodLoggerConfig: PinoLoggerOptions = {
    level: "info",
};

export const appConfig: FastifyServerOptions = {
    logger: isDev ? devLoggerConfig : prodLoggerConfig,
};

let app: FastifyInstance | null = null;

try {
    app = fastify(appConfig);

    // CORS
    // TODO: Use env variable to switch between production & development?
    app.register(cors, { origin: "*" }); // Register cors plugin

    // JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error(`JWT_SECRET environment variable is required`);
    // TODO: Add more options here for JWT, see: https://github.com/fastify/fastify-jwt

    await app.register(jwt, { secret }); // Register jwt plugin

    await app.register(dbPlugin); // Register database plugin
    await app.register(wsPlugin); // Register websocket plugin
    await app.register(authPlugin); // Register auth plugin
    await app.register(userPlugin); // Register user plugin

    // Seed database in dev mode
    if (isDev) await seed(app);

    // Start server
    const port = process.env.BACKEND_PORT ? +process.env.BACKEND_PORT : 3000;
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server running at port ${port}!`);
} catch (error) {
    console.error(`Failed to start server: `, error);
    // Safely close the server, trigger all onClose hooks
    if (app) app.close();
    process.exit(1);
}
