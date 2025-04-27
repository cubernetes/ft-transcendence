import type { FastifyInstance } from "fastify/types/instance";
import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import * as schema from "./db.schema.ts";

export type DbClient = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const dbPlugin = async (app: FastifyInstance) => {
    try {
        const { dbPath, dbDir } = app.config;
        const sqlite = new Database(dbPath);

        // Ensure to close sqlite connection on shutdown
        app.addHook("onClose", async (instance) => {
            instance.log.info("On close hook triggered: Closing SQLite connection...");
            try {
                sqlite.close();
                instance.log.info("SQLite closed");
            } catch (error) {
                // Log error but no need to rethrow
                instance.log.error({ error }, "Error closing SQLite");
            }
        });

        const db: DbClient = drizzle(sqlite, { schema });

        // Better-sqlite3 is synchronous, but await still recommended for future-proofing
        await migrate(db, { migrationsFolder: path.join(dbDir, "migrations") });

        app.decorate("db", db);
    } catch (error) {
        app.log.error({ error }, "Fail to initialize database");
        throw error;
    }
};

export default fp(dbPlugin, {
    name: "db-plugin",
    dependencies: ["config-plugin"],
});
