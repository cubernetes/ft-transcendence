import type { FastifyServerOptions } from "fastify";
import { spawn } from "child_process";
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
process.env.BACKEND_PORT = secrets.value.BACKEND_PORT;
process.env.DB_PATH = secrets.value.DB_PATH;
process.env.LOGSTASH_HOST = secrets.value.LOGSTASH_HOST;
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

    try {
        const backendPort = process.env.BACKEND_PORT ?? "invalid"; // Provide invalid port so curl's status is 3, clearly indicating something when wrong

        const subprocess = spawn(
            "sh",
            [
                "-c",
                "TERM=linux setsid watch -tn5 curl --no-progress-meter --fail --write-out '%output{/tmp/healthcheck}%{exitcode}' \"http://localhost:${1}/healthcheck\" 1>/dev/null 2>&1",
                "sh",
                backendPort,
            ],
            {
                detached: true,
                stdio: "ignore",
                shell: false, // if you want shell features like variable expansion etc.
            }
        );

        subprocess.unref(); // Fully detach the subprocess
        app.log.debug(`Forked off healthcheck child process`);
    } catch (err) {
        app.log.warn(
            { err },
            "Could not spawn background healthcheck, service will show as unhealthy in docker"
        );
    }

    await app.listen({ port, host });
    app.log.info(`Server running at port ${port}!`);
} catch (error) {
    app.log.error({ error }, "Fatal unknown error when running app");
    process.exit(1);
}
