import type { FastifyServerOptions } from "fastify";
import { buildApp } from "./utils/app.ts";
import { getLoggerConfig } from "./utils/logger.ts";
import { readVaultOnce } from "./utils/vault.ts";

// Read vault secrets
const secrets = await readVaultOnce("secret/data/backend");

if (secrets.isErr()) {
    console.error(`fatal error when reading vault secrets: ${secrets.error}`);
    process.exit(1);
}

Object.assign(process.env, secrets.value);

// Fastify server options, cannot be changed once instance is created
const appOpts: FastifyServerOptions = { logger: await getLoggerConfig() };

// Build app
const tryBuild = await buildApp(appOpts);

if (tryBuild.isErr()) {
    console.error(`fatal error when building app: ${tryBuild.error}`);
    process.exit(1);
}

const app = tryBuild.value;

try {
    const { port, host } = app.config;

    await app.listen({ port, host });
} catch (error) {
    app.log.error({ error }, "fatal error when running app");
    process.exit(1);
}
