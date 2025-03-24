import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./db.schema.ts";
import path from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { FastifyInstance } from "fastify/types/instance";

export type DbClient = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const dbPlugin = async (app: FastifyInstance) => {
    try {
        const { dbPath, dbDir } = app.config;
        const sqlite = new Database(dbPath);

        /** Ensure to close sqlite connection on shutdown */
        app.addHook("onClose", async (instance) => {
            instance.log.info("On close hook triggered: Closing SQLite connection...");
            try {
                sqlite.close();
                instance.log.info("SQLite closed");
            } catch (err) {
                /** Log error but no need to rethrow */
                instance.log.error({ err }, "Error closing SQLite");
            }
        });

        const db: DbClient = drizzle(sqlite, { schema });

        /** Better-sqlite3 is synchronous, but await still recommended for future-proofing */
        await migrate(db, { migrationsFolder: path.join(dbDir, "migrations") });

        app.decorate("db", db);
    } catch (err) {
        app.log.error({ err }, "Fail to initialize database");
        throw err;
    }
};

export default fp(dbPlugin, {
    name: "db-plugin",
    dependencies: ["config-plugin"],
});
