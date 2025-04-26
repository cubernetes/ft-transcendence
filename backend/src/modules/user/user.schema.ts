import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, schemas } from "@darrenkuro/pong-core";

/** Schemas for swagger UI */
const registerRouteSchema = {
    tags: ["User"],
    description: "Register a new user",
    body: zodToJsonSchema(schemas.registerBody),
    response: {
        201: zodToJsonSchema(apiSuccess(schemas.loginPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        409: zodToJsonSchema(apiError("USERNAME_TAKEN")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const loginRouteSchema = {
    tags: ["User"],
    description: "Login an user",
    body: zodToJsonSchema(schemas.loginBody),
    response: {
        201: zodToJsonSchema(apiSuccess(schemas.loginPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("NOT_FOUND")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const getMeRouteSchema = {
    tags: ["User"],
    description: "Get current user info",
    security: [{ bearerAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(schemas.getMePayload)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const getLeaderboardRouteSchema = {
    tags: ["User"],
    description: "Get top n users by wins",
    params: zodToJsonSchema(schemas.leaderboardParams),
    response: {
        200: zodToJsonSchema(apiSuccess(schemas.leaderboardPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

export default {
    register: registerRouteSchema,
    login: loginRouteSchema,
    me: getMeRouteSchema,
    leaderboard: getLeaderboardRouteSchema,
};
