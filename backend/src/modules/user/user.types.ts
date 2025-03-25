import { z } from "zod";
import schemas from "./user.schema.ts";
import { users } from "../../core/db/db.schema.ts";

export type RegisterBody = z.infer<typeof schemas.registerBody>;
export type LoginBody = z.infer<typeof schemas.loginBody>;
export type LeaderboardParams = z.infer<typeof schemas.leaderboardParams>;

export type PublicUser = z.infer<typeof schemas.publicUser>;

// Problematic, such that default field shown as possibly null
// Only use for db operations?
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
