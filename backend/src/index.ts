import type { FastifyServerOptions } from "fastify";
import buildApp from "./utils/app.ts";
import { devLoggerConfig, prodLoggerConfig } from "./utils/logger.ts";

try {
    // Fastify server options, cannot be changed once instance is created
    const appOpts: FastifyServerOptions = {
        logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
    };

    await buildApp(appOpts);
} catch (err) {
    console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    process.exit(1);
}
