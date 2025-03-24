import type { FastifyServerOptions } from "fastify";
import buildApp from "./utils/app.ts";
import { devLoggerConfig, prodLoggerConfig } from "./utils/logger.ts";

// Fastify server options, cannot be changed once instance is created
const appOpts: FastifyServerOptions = {
    logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
};

const tryBuild = await buildApp(appOpts);

if (tryBuild.success) {
    const app = tryBuild.data;
    const { port, host } = app.config;
    await app.listen({ port, host });
    app.log.info(`Server running at port ${port}!`);
} else {
    console.error(JSON.stringify(tryBuild.error, Object.getOwnPropertyNames(tryBuild.error), 2)); // TODO: Handle this better, problem is that fastify is closed
    process.exit(1);
}
