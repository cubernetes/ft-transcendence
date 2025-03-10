import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./db.schema";
import path from "path";
import fs from "fs";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { FastifyInstance } from "fastify/types/instance";

type DbClient = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const dbPlugin = async (fastify: FastifyInstance) => {
    try {
        // Ensure DB_PATH is set
        const dbPath = process.env.DB_PATH;
        if (!dbPath) throw new Error("DB_PATH environment variable is not set");

        // Ensure the directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

        // Create database connection, create one if doesn't exist
        const sqlite = new Database(dbPath);

        // Ensure to close sqlite connection on shutdown
        fastify.addHook(`onClose`, async (instance) => {
            instance.log.info(`On close hook triggered: Closing SQLite connection...`);
            try {
                sqlite.close();
                instance.log.info(`SQLite closed`);
            } catch (error) {
                // Log error but no need to rethrow
                instance.log.error({ err: error }, `Error closing SQLite`);
            }
        });

        const db: DbClient = drizzle(sqlite, { schema });
        // Even though better-sqlite3 is synchronous, we await the migration for future-proofing
        await migrate(db, { migrationsFolder: path.join(dbDir, "migrations") });

        fastify.decorate("db", db);
    } catch (error) {
        fastify.log.error({ err: error }, "Fail to initialize database");
        throw error;
    }
};

export default fp(dbPlugin, {
    name: "db-plugin",
});
