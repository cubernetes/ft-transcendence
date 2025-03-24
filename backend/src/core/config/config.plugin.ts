import type { FastifyInstance } from "fastify";
import { configSchema } from "./config.schema.ts";
import fs from "fs";
import path from "path";
import fp from "fastify-plugin";

/** NODE_ENV should be used as process.env.NODE_ENV to ensure dead code is removed by esbuild */
const configPlugin = async (fastify: FastifyInstance): Promise<void> => {
    /** Validate config integrity */
    const parsedEnv = configSchema.parse(process.env);

    const port = parsedEnv.BACKEND_PORT;
    const jwtSecret = parsedEnv.JWT_SECRET;
    const dbPath = parsedEnv.DB_PATH;
    const dbDir = path.dirname(parsedEnv.DB_PATH);
    const apiPrefix = process.env.API_PREFIX ?? "/api";
    const host = process.env.HOST ?? "0.0.0.0";

    if (!fs.existsSync(dbDir)) {
        throw new Error("Directory for database does not exist");
    }

    const config = { port, jwtSecret, dbPath, dbDir, apiPrefix, host };
    fastify.decorate("config", config);
};

export default fp(configPlugin, { name: "config-plugin" });
