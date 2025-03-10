import type { Config } from "./index.d";
import type { FastifyServerOptions } from "fastify";
import type { PinoLoggerOptions } from "fastify/types/logger";

const isDev = process.env.NODE_ENV === "development";
const port = process.env.BACKEND_PORT ? +process.env.BACKEND_PORT : 3000;
const jwtSecret = process.env.JWT_SECRET ?? null;

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

const appOpts: FastifyServerOptions = {
    logger: isDev ? devLoggerConfig : prodLoggerConfig,
};

export const config: Config = { isDev, port, jwtSecret, opts: appOpts };
