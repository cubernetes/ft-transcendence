import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./db.schema.ts";
import path from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { FastifyInstance } from "fastify/types/instance";

export type DbClient = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const dbPlugin = async (fastify: FastifyInstance) => {
    try {
        const { dbPath, dbDir } = fastify.config;
        const sqlite = new Database(dbPath);

        /** Ensure to close sqlite connection on shutdown */
        fastify.addHook("onClose", async (instance) => {
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

        fastify.decorate("db", db);
    } catch (err) {
        fastify.log.error({ err }, "Fail to initialize database");
        throw err;
    }
};

export default fp(dbPlugin, {
    name: "db-plugin",
    dependencies: ["config-plugin"],
});
