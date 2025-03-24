import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { resError, resSuccess } from "../../core/api/api.schema.ts";

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

export const loginUserSchema = z.object({
    username: z.string().min(3, { message: "Username is required" }),
    password: z.string().min(8, { message: "Password is required" }),
});

export const userIdSchema = z.object({
    id: z.coerce.number().int().gt(0),
});

export const leaderboardSchema = z.object({
    n: z.coerce.number().int().gt(0),
});

export const userNameSchema = z.object({
    username: z.string().min(3, { message: "Username is required" }),
});

export const PublicUserSchema = z.object({
    id: z.number(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().url(),
    wins: z.number(),
    losses: z.number(),
    createdAt: z.string().datetime(),
});

export const LoginSchema = z.object({
    token: z.string(),
});

export const authenticationSchema = z.object({
    authorization: z.string().startsWith("Bearer ", { message: "Invalid Bearer token format" }),
});

// export const updateUserSchema = z.object({
//     id: z.coerce.number().int().gt(0),
//     username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
//     displayName: z.string().min(3, { message: "Display name must be at least 3 characters long" }),
// });

/** Schemas for swagger UI */

export const createRouteSchema = {
    schema: {
        body: zodToJsonSchema(createUserSchema),
        response: {
            201: zodToJsonSchema(resSuccess(LoginSchema)),
            400: zodToJsonSchema(resError(["VALIDATION_ERROR"])),
            409: zodToJsonSchema(resError(["USERNAME_TAKEN"])),
            500: zodToJsonSchema(resError(["INTERNAL_SERVER_ERROR"])),
        },
    },
};

export const getUserByIdRouteSchema = {
    schema: {
        params: zodToJsonSchema(userIdSchema),
        response: {
            200: zodToJsonSchema(resSuccess(PublicUserSchema)),
            400: zodToJsonSchema(resError(["BAD_REQUEST"])),
            404: zodToJsonSchema(resError(["NOT_FOUND"])),
            500: zodToJsonSchema(resError(["INTERNAL_SERVER_ERROR"])),
        },
    },
};
