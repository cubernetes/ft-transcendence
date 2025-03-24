import type { FastifyServerOptions } from "fastify";
import { buildApp } from "./utils/app.ts";
import { devLoggerConfig, prodLoggerConfig } from "./utils/logger.ts";

/** Fastify server options, cannot be changed once instance is created */
const appOpts: FastifyServerOptions = {
    logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
};

try {
    await buildApp(appOpts);
} catch (err) {
    /** No need to log error because it's extremely likely to be logged by Fastify */
    process.exit(1);
}
