import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, userSchema } from "@darrenkuro/pong-core";

const register = {
    tags: ["User"],
    description: "Register a new user",
    body: zodToJsonSchema(userSchema.registerBody),
    response: {
        201: zodToJsonSchema(apiSuccess(userSchema.loginPayload)),
        400: zodToJsonSchema(
            z.union([
                apiError("VALIDATION_ERROR"),
                apiError("USERNAME_REQUIRED"),
                apiError("USERNAME_TOO_SHORT"),
                apiError("DISPLAY_NAME_REQUIRED"),
                apiError("DISPLAY_NAME_TOO_SHORT"),
                apiError("PASSWORD_REQUIRED"),
                apiError("PASSWORD_TOO_SHORT"),
                apiError("PASSWORD_MATCH_ERROR"),
            ])
        ),
        409: zodToJsonSchema(apiError("USERNAME_TAKEN")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const login = {
    tags: ["User"],
    description: "Login an user",
    body: zodToJsonSchema(userSchema.loginBody),
    response: {
        200: zodToJsonSchema(apiSuccess(userSchema.loginPayload)),
        400: zodToJsonSchema(
            z.union([
                apiError("VALIDATION_ERROR"),
                apiError("USERNAME_REQUIRED"),
                apiError("PASSWORD_REQUIRED"),
                apiError("TOKEN_LENGTH_ERROR"),
            ])
        ),
        401: zodToJsonSchema(z.union([apiError("PASSWORD_INVALID"), apiError("TOKEN_INVALID")])),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const logout = {
    tags: ["User"],
    description: "Logout an user (clear cookies)",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
    },
};

const displayname = {
    tags: ["User"],
    description: "Logout an user (clear cookies)",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(
            z.union([
                apiError("VALIDATION_ERROR"),
                apiError("DISPLAY_NAME_REQUIRED"),
                apiError("DISPLAY_NAME_TOO_SHORT"),
            ])
        ),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const password = {
    tags: ["User"],
    description: "Change password of a user",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(
            z.union([
                apiError("VALIDATION_ERROR"),
                apiError("PASSWORD_REQUIRED"),
                apiError("PASSWORD_TOO_SHORT"),
                apiError("PASSWORD_MATCH_ERROR"),
            ])
        ),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const info = {
    tags: ["User"],
    description: "Get user info by username",
    response: {
        200: zodToJsonSchema(apiSuccess(userSchema.getInfoPayload)),
        400: zodToJsonSchema(
            z.union([apiError("VALIDATION_ERROR"), apiError("USERNAME_REQUIRED")])
        ),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const me = {
    tags: ["User"],
    description: "Get current user info",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(userSchema.getMePayload)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const leaderboard = {
    tags: ["User"],
    description: "Get top n users by wins",
    params: zodToJsonSchema(userSchema.leaderboardParams),
    response: {
        200: zodToJsonSchema(apiSuccess(userSchema.leaderboardPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const avatar = {
    tags: ["User"],
    description: "Upload user avatar",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(userSchema.avatarPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

export const routeSchema = {
    register,
    login,
    logout,
    displayname,
    password,
    leaderboard,
    info,
    me,
    avatar,
};
