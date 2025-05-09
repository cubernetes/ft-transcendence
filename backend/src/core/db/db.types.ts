import type { games, users } from "./db.schema.ts";
import type * as schema from "./db.schema.ts";
import type Database from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export type DbClient = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

export type GameRecord = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
export type UserRecord = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
