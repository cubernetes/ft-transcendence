import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import { CONST } from "./config.constants.ts";
import { configSchema } from "./config.schema.ts";
import { AppConfig } from "./config.types.ts";

/** NODE_ENV should be used as process.env.NODE_ENV to ensure dead code is removed by esbuild */
const plugin = async (app: FastifyInstance): Promise<void> => {
    // Validate config integrity with zod schema
    const parsedEnv = configSchema.parse(process.env);

    const port = parsedEnv.BACKEND_PORT;
    const jwtSecret = parsedEnv.JWT_SECRET;
    const dbPath = parsedEnv.DB_PATH;
    const apiPrefix = parsedEnv.API_PREFIX;
    const host = parsedEnv.HOST;
    const domains = parsedEnv.DOMAINS;

    // DB_DIR can be explicitly set, for testing purposes when DB_PATH is ":memory:"
    const dbDir = process.env.DB_DIR ?? path.dirname(parsedEnv.DB_PATH);
    if (!fs.existsSync(dbDir)) {
        throw new Error("directory for database does not exist");
    }

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
        ...CONST,
    };

    app.decorate("config", config);
};

export const configPlugin = fp(plugin, { name: "config-plugin" });
