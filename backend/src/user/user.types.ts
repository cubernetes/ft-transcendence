import { users } from "../db/db.schema.ts";
import {
    authenticationSchema,
    createUserSchema,
    loginUserSchema,
    PublicUserSchema,
    userIdSchema,
    userNameSchema,
} from "./user.schema.ts";
import { z } from "zod";

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export type UserIdDTO = z.infer<typeof userIdSchema>;
export type UserNameDTO = z.infer<typeof userNameSchema>;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = z.infer<typeof PublicUserSchema>;

export type AuthenticationDTO = z.infer<typeof authenticationSchema>;
