import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import path from "path";
import fs from "fs";
import { configSchema } from "./config.schema.ts";
import { AppConfig } from "./config.types.ts";

const readVaultOnce = async (path: string) => {
	const vaultToken = fs.readFileSync("/run/secrets/backend_vault_token", "utf8");

	const promise = fetch(`http://vault:8200/v1/${path}`, {headers:{"X-Vault-Token": vaultToken}})
		.then(async (resp) => {
			const respText = await resp.text();
			if (!resp.ok) {
				throw new Error(`Request to vault API was NOT OK:\n${respText}`);
			}
			return respText;
		})
		.then((text) => {
			try {
				return JSON.parse(text).data.data;
			} catch (e) {
				throw new Error(`Failed to parse JSON response:\n${text}`);
			}
		})
		.catch((e) => {
			throw new Error(`Request to vault API FAILED:\n${e}`);
		});

	fs.writeFileSync("/run/secrets/backend_vault_token", ""); // clear, since not needed anymore, but token-max-use should be set to 1 anyways

	return promise;
}

/** NODE_ENV should be used as process.env.NODE_ENV to ensure dead code is removed by esbuild */
const configPlugin = async (app: FastifyInstance): Promise<void> => {
    // Validate config integrity with zod schema


	const secrets = await readVaultOnce("secret/data/backend");
	const rawJwtSecret = secrets.JWT_SECRET;

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
