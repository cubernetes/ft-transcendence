import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import type { FastifyInstance, FastifyServerOptions } from "fastify";
import type { PinoLoggerOptions } from "fastify/types/logger";
import { z, ZodError } from "zod";

/**
 * NODE_ENV should be used outside of config, and always explicit as process.env.NODE_ENV.
 * So that dead code is removed by esbuild. (Just to be safe, not sure how define works.)
 */
const configSchema = z.object({
    BACKEND_PORT: z.coerce
        .number({
            required_error: "cannot be empty",
            invalid_type_error: "must be a number",
        })
        .int("must be an integer")
        .positive("must be a positive number"),

    JWT_SECRET: z.string().min(1, "cannot be empty"),
    DB_PATH: z.string().min(1, "cannot be empty"),
});

/** Fastify server options, cannot be changed once instance is created */

const formatError = (error: unknown) => {
    if (error instanceof ZodError) {
        return {
            name: "ZodError",
            issues: error.issues.map((i) => `${i.path}: ${i.message}`),
        };
    }

    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack ?? "No stack trace available",
        };
    }

    /** Fallback for unknown error */
    return {
        message: String(error),
    };
};

const devLoggerConfig: PinoLoggerOptions = {
    level: "debug", // More detailed logs in dev
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true, // Enables colors for better readability
            translateTime: "HH:MM:ss Z", // Formats timestamps
            ignore: "pid,hostname", // Hides unnecessary fields
        },
    },
    serializers: { err: formatError },
};

const prodLoggerConfig: PinoLoggerOptions = { level: "info" };

export const appOpts: FastifyServerOptions = {
    logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
};

// The problem here is that if not using process.env.NODE_ENV
// the static replace by esbuild wouldn't remove dead code
const configPlugin = async (fastify: FastifyInstance) => {
    /** Validate config integrity */
    const parsedEnv = configSchema.parse(process.env);

    const port = parsedEnv.BACKEND_PORT;
    const jwtSecret = parsedEnv.JWT_SECRET;
    const dbPath = parsedEnv.DB_PATH;
    const dbDir = path.dirname(parsedEnv.DB_PATH);
    if (!fs.existsSync(dbDir)) throw new Error("Directory for database does not exist");

    const config = { port, jwtSecret, dbPath, dbDir };
    fastify.decorate("config", config);
};

export default fp(configPlugin, {
    name: "config-plugin",
});
