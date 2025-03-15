import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import type { FastifyInstance, FastifyServerOptions } from "fastify";
import { z } from "zod";
import { devLoggerConfig, prodLoggerConfig } from "./logger";

const configSchema = z.object({
    BACKEND_PORT: z.coerce
        .number({
            required_error: "cannot be empty",
            invalid_type_error: "must be a number",
        })
        .int("must be an integer")
        .min(1024, "must be greater than 1023") // Avoid privileged / reversed
        .max(65535, "must be less than 65536"),

    JWT_SECRET: z.string().min(32, "must be at least 32 characters long"),
    DB_PATH: z.string().min(1, "cannot be empty"),
});

/** Fastify server options, cannot be changed once instance is created */
export const appOpts: FastifyServerOptions = {
    logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
};

/** NODE_ENV should be used as process.env.NODE_ENV to ensure dead code is removed by esbuild */
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

export type Config = {
    port: number;
    jwtSecret: string;
    dbPath: string;
    dbDir: string;
};

export default fp(configPlugin, {
    name: "config-plugin",
});
