import type { DbClient } from "./db.types.ts";
import type { FastifyInstance } from "fastify/types/instance";
import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import * as schema from "./db.schema.ts";

const plugin = async (app: FastifyInstance) => {
    try {
        const { dbPath, dbDir } = app.config;
        const sqlite = new Database(dbPath);

        // Ensure to close sqlite connection on shutdown
        const onCloseHook = async (app: FastifyInstance) => {
            app.log.debug("on close hook triggered");
            try {
                app.log.info("closing database...");
                sqlite.close();
                app.log.info("SQLite closed");
            } catch (error) {
                // Log error but no need to rethrow
                app.log.error({ error }, "error closing SQLite");
            }
        };
        app.addHook("onClose", onCloseHook);

        const db: DbClient = drizzle(sqlite, { schema });

        // Better-sqlite3 is synchronous, but await still recommended for future-proofing
        await migrate(db, { migrationsFolder: path.join(dbDir, "migrations") });

        app.decorate("db", db);
    } catch (error) {
        app.log.error({ error }, "fail to initialize database");
        throw error;
    }
};

export const dbPlugin = fp(plugin, { name: "db-plugin", dependencies: ["config-plugin"] });
