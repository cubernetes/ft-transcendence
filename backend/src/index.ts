import type { FastifyServerOptions } from "fastify";
import buildApp from "./utils/app.ts";
import { devLoggerConfig, prodLoggerConfig } from "./utils/logger.ts";
import { readVaultOnce } from "./utils/vault.ts";

// Read vault secrets
const secrets = await readVaultOnce("secret/data/backend");

if (secrets.isErr()) {
    console.error(`Fatal error when reading vault secrets: ${secrets.error.message}`);
    process.exit(1);
}

process.env.JWT_SECRET = secrets.value.JWT_SECRET;
process.env.DB_PATH = secrets.value.DB_PATH;
process.env.LOGSTASH_HOSTNAME = secrets.value.LOGSTASH_HOSTNAME;
process.env.LOGSTASH_PORT = secrets.value.LOGSTASH_PORT;
process.env.API_PREFIX = secrets.value.API_PREFIX;
process.env.HOST = secrets.value.HOST;

// Fastify server options, cannot be changed once instance is created
const appOpts: FastifyServerOptions = {
    logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
};

// Build app
const tryBuild = await buildApp(appOpts);

if (tryBuild.isErr()) {
    console.error(`Fatal error when building app: ${tryBuild.error.message}`);
    process.exit(1);
}

const app = tryBuild.value;

try {
    const { port, host } = app.config;

    await app.listen({ port, host });
    app.log.info(`Server running at port ${port}!`);
} catch (error) {
    app.log.error({ error }, "Fatal unknown error when running app");
    process.exit(1);
}
