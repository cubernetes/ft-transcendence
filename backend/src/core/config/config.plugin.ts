import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import { configSchema } from "./config.schema.ts";
import { AppConfig, CookieConfig } from "./config.types.ts";

// Constants
const COOKIE_NAME = "token";
const COOKIE_CONFIG: CookieConfig = {
    path: "/",
    //secure: true, // send cookie over HTTPS only
    httpOnly: true,
    //sameSite: true, // alternative CSRF protection
};
const TOTP_ENCODING = "base32";

/** NODE_ENV should be used as process.env.NODE_ENV to ensure dead code is removed by esbuild */
const configPlugin = async (app: FastifyInstance): Promise<void> => {
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
        throw new Error("Directory for database does not exist");
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
        cookieName: COOKIE_NAME,
        cookieConfig: COOKIE_CONFIG,
        totpEncoding: TOTP_ENCODING,
    };

    app.decorate("config", config);
};

export default fp(configPlugin, { name: "config-plugin" });
