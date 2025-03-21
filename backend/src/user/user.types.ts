import { users } from "../db/db.schema.ts";
import { createUserSchema, PublicUserSchema, userIdSchema, userNameSchema } from "./user.schema.ts";
import { z } from "zod";

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UserIdDTO = z.infer<typeof userIdSchema>;
export type UserNameDTO = z.infer<typeof userNameSchema>;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = z.infer<typeof PublicUserSchema>;
