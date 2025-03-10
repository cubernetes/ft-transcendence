import { users } from "../db/db.schema";
import { z } from "zod";

export const createUserSchema = z
    .object({
        username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
        displayName: z
            .string()
            .min(3, { message: "Display name must be at least 3 characters long" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
        confirmPassword: z
            .string()
            .min(8, { message: "Confirm password must be at least 8 characters long" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export const userIdSchema = z.object({
    id: z.coerce.number().int().gt(0),
});

export const usernameSchema = z.object({
    username: z.string().min(3, { message: "Username is required" }),
});

// export const updateUserSchema = z.object({
//     id: z.coerce.number().int().gt(0),
//     username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
//     displayName: z.string().min(3, { message: "Display name must be at least 3 characters long" }),
// });

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UserIdDTO = z.infer<typeof userIdSchema>;
export type UsernameDTO = z.infer<typeof usernameSchema>;

// export type CreateUserSchemas = { body: z.infer<typeof createUserSchema> };
// export type UserIdSchemas = { params: z.infer<typeof userIdSchema> };

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// export type UserInsertBody = Omit<UserInsert, "passwordHash"> & {
//     password: string;
// };
// export type UserLoginBody = Pick<UserInsertBody, "username" | "password">;
