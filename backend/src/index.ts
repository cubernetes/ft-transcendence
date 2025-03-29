import type { FastifyServerOptions } from "fastify";
import buildApp from "./utils/app.ts";
import { devLoggerConfig, prodLoggerConfig } from "./utils/logger.ts";
import { readVaultOnce } from "./utils/vault.ts";

// Fastify server options, cannot be changed once instance is created
const appOpts: FastifyServerOptions = {
    logger: process.env.NODE_ENV === "production" ? prodLoggerConfig : devLoggerConfig,
};

// Read vault secrets
const secrets = await readVaultOnce("secret/data/backend");

if (secrets.isErr()) {
    console.error(`Fatal error when reading vault secrets: ${secrets.error.message}`);
    process.exit(1);
}

process.env.JWT_SECRET = secrets.value.JWT_SECRET;

// Build app
const tryBuild = await buildApp(appOpts);

if (tryBuild.isErr()) {
    console.error(`Fatal error when building app: ${tryBuild.error.message}`);
    process.exit(1);
}

const app = tryBuild.value;
const { port, host } = app.config;

await app.listen({ port, host });
app.log.info(`Server running at port ${port}!`);
