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

const getTotpSetupRouteSchema = {
    tags: ["User"],
    description: "Get the data URI for a QR code image to provision the TOTP 2FA",
    security: [{ bearerAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(schemas.totpSetupPayload)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const getTotpVerifyRouteSchema = {
    tags: ["User"],
    description: "Verify a 6-digit TOTP token",
    body: zodToJsonSchema(schemas.totpBody),
    response: {
        200: zodToJsonSchema(apiSuccess(schemas.totpVerifyPayload)),
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
    totpSetup: getTotpSetupRouteSchema,
    totpVerify: getTotpVerifyRouteSchema,
    leaderboard: getLeaderboardRouteSchema,
};
