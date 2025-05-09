import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, userSchemas } from "@darrenkuro/pong-core";

const registerRouteSchema = {
    tags: ["User"],
    description: "Register a new user",
    body: zodToJsonSchema(userSchemas.registerBody),
    response: {
        201: zodToJsonSchema(apiSuccess(userSchemas.loginPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        409: zodToJsonSchema(apiError("USERNAME_TAKEN")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const loginRouteSchema = {
    tags: ["User"],
    description: "Login an user",
    body: zodToJsonSchema(userSchemas.loginBody),
    response: {
        201: zodToJsonSchema(apiSuccess(userSchemas.loginPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const logoutRouteSchema = {
    tags: ["User"],
    description: "Logout an user (clear cookies)",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
    },
};

const getInfoRouteSchema = {
    tags: ["User"],
    description: "Get user info by username",
    response: {
        200: zodToJsonSchema(apiSuccess(userSchemas.getInfoPayload)),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const getMeRouteSchema = {
    tags: ["User"],
    description: "Get current user info",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(userSchemas.getMePayload)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const getLeaderboardRouteSchema = {
    tags: ["User"],
    description: "Get top n users by wins",
    params: zodToJsonSchema(userSchemas.leaderboardParams),
    response: {
        200: zodToJsonSchema(apiSuccess(userSchemas.leaderboardPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

export default {
    register: registerRouteSchema,
    login: loginRouteSchema,
    logout: logoutRouteSchema,
    getInfo: getInfoRouteSchema,
    getMe: getMeRouteSchema,
    getLeaderboard: getLeaderboardRouteSchema,
};
