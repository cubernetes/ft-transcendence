import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import path from "path";
import fs from "fs";
import { configSchema } from "./config.schema.ts";
import { AppConfig } from "./config.types.ts";

export const readVaultSecret = async (vaultToken: string, apiBaseAddr: string, path: string, key: string) => {
	const apiAddr = `${apiBaseAddr}/v1/${path}`;
	return fetch(apiAddr, {headers: {"X-Vault-Token": vaultToken}})
	.then((resp) => resp.json())
	.then((data) => data.data.data[key]); // wtf
}

/** NODE_ENV should be used as process.env.NODE_ENV to ensure dead code is removed by esbuild */
const configPlugin = async (app: FastifyInstance): Promise<void> => {
    // Validate config integrity with zod schema

	let vaultToken = fs.readFileSync("/run/secrets/backend_vault_token", "utf8");

	const rawJwtSecret = await readVaultSecret(vaultToken, "http://vault:8200", "secret/data/backend", "JWT_SECRET"); // maybe pass these as a (vault config) object?
	/* ... */
	/* read more secrets from vault if needed */

	fs.writeFileSync("/run/secrets/backend_vault_token", ""); // clear, since not needed anymore
	vaultToken = '';

    const parsedEnv = configSchema.parse({...process.env, JWT_SECRET: rawJwtSecret});

    const port = parsedEnv.BACKEND_PORT;
    const jwtSecret = parsedEnv.JWT_SECRET;
    const dbPath = parsedEnv.DB_PATH;
    const dbDir = process.env.DB_DIR ?? path.dirname(parsedEnv.DB_PATH);
    if (!fs.existsSync(dbDir)) {
        throw new Error("Directory for database does not exist");
    }

    const apiPrefix = process.env.API_PREFIX ?? "/api";
    const host = process.env.HOST ?? "0.0.0.0";
    const domains = process.env.DOMAINS?.split(" ") ?? ["localhost"];
    const corsOrigin =
        process.env.NODE_ENV === "production"
            ? domains.flatMap((d) => [`https://${d}`, `http://${d}`])
            : "*";

    const config: AppConfig = {
        port,
        jwtSecret,
        dbPath,
        dbDir,
        apiPrefix,
        host,
        domains,
        corsOrigin,
    };

    app.decorate("config", config);
};

export default fp(configPlugin, { name: "config-plugin" });
