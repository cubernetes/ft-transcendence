import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess } from "../../core/api/api.schema.ts";

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

export const leaderboardSchema = z.object({
    n: z.coerce.number().int().gt(0),
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

/** Schemas for swagger UI */

export const registerRouteSchema = {
    tags: ["User"],
    description: "Register a new user",
    body: zodToJsonSchema(createUserSchema),
    response: {
        201: zodToJsonSchema(apiSuccess(LoginSchema)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        409: zodToJsonSchema(apiError("USERNAME_TAKEN")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

export const loginRouteSchema = {
    tags: ["User"],
    description: "Login an user",
    body: zodToJsonSchema(loginUserSchema),
    response: {
        201: zodToJsonSchema(apiSuccess(LoginSchema)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("NOT_FOUND")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

export const getMeRouteSchema = {
    tags: ["User"],
    description: "Get current user info",
    security: [{ bearerAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(PublicUserSchema)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

export const getLeaderboardRouteSchema = {
    tags: ["User"],
    description: "Get top n users by wins",
    params: zodToJsonSchema(leaderboardSchema),
    response: {
        200: zodToJsonSchema(apiSuccess(PublicUserSchema.array())),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};
