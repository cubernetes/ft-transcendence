import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, totpSchema } from "@darrenkuro/pong-core";

const setup = {
    tags: ["Totp"],
    description: "Get the data URI for a QR code image to provision the TOTP 2FA",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(totpSchema.setupPayload)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const verify = {
    tags: ["Totp"],
    description: "Verify a 6-digit TOTP token",
    security: [{ cookieAuth: [] }],
    body: zodToJsonSchema(totpSchema.totpBody),
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(z.union([apiError("VALIDATION_ERROR"), apiError("TOKEN_REQUIRED")])),
        401: zodToJsonSchema(z.union([apiError("UNAUTHORIZED"), apiError("TOKEN_INVALID")])),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const update = {
    tags: ["Totp"],
    description: "Update 2FA secret",
    security: [{ cookieAuth: [] }],
    body: zodToJsonSchema(totpSchema.totpUpdateBody),
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(z.union([apiError("VALIDATION_ERROR"), apiError("TOKEN_REQUIRED")])),
        401: zodToJsonSchema(z.union([apiError("UNAUTHORIZED"), apiError("TOKEN_INVALID")])),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const disable = {
    tags: ["Totp"],
    description: "Turn off 2FA",
    security: [{ cookieAuth: [] }],
    body: zodToJsonSchema(totpSchema.totpBody),
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(z.union([apiError("VALIDATION_ERROR"), apiError("TOKEN_REQUIRED")])),
        401: zodToJsonSchema(z.union([apiError("UNAUTHORIZED"), apiError("TOKEN_INVALID")])),
        404: zodToJsonSchema(apiError("USER_NOT_FOUND")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

export const routeSchema = { setup, verify, update, disable };
