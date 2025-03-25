import type { FastifyServerOptions } from "fastify";
import buildApp from "./utils/app.ts";
import { devLoggerConfig, prodLoggerConfig } from "./utils/logger.ts";

// Fastify server options, cannot be changed once instance is created
const appOpts: FastifyServerOptions = {
    logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
};

const tryBuild = await buildApp(appOpts);

if (tryBuild.isErr()) {
    console.error(tryBuild.error.message);
    process.exit(1);
}

const app = tryBuild.value;
const { port, host } = app.config;

await app.listen({ port, host });
app.log.info(`Server running at port ${port}!`);
