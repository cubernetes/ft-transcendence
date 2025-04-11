import { users } from "../../core/db/db.schema.ts";

// Problematic, such that default field shown as possibly null
// Only use for db operations?
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
