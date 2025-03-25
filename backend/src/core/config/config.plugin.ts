import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import path from "path";
import fs from "fs";
import { configSchema } from "./config.schema.ts";

/** NODE_ENV should be used as process.env.NODE_ENV to ensure dead code is removed by esbuild */
const configPlugin = async (app: FastifyInstance): Promise<void> => {
    // Validate config integrity with zod schema
    const parsedEnv = configSchema.parse(process.env);

    const port = parsedEnv.BACKEND_PORT;
    const jwtSecret = parsedEnv.JWT_SECRET;
    const dbPath = parsedEnv.DB_PATH;
    const dbDir = process.env.DB_DIR ?? path.dirname(parsedEnv.DB_PATH);
    const apiPrefix = process.env.API_PREFIX ?? "/api";
    const host = process.env.HOST ?? "0.0.0.0";
    const domain = process.env.DOMAINS ?? "*";

    if (!fs.existsSync(dbDir)) {
        throw new Error("Directory for database does not exist");
    }

    const config = { port, jwtSecret, dbPath, dbDir, apiPrefix, host, domain };
    app.decorate("config", config);
};

export default fp(configPlugin, { name: "config-plugin" });
