import { games, users } from "./db.schema.ts";

export type GameRecord = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
export type UserRecord = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
