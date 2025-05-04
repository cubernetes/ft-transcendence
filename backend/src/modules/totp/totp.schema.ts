import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, totpSchemas } from "@darrenkuro/pong-core";

const setup = {
    tags: ["Totp"],
    description: "Get the data URI for a QR code image to provision the TOTP 2FA",
    security: [{ cookieAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(totpSchemas.setupPayload)),
        400: zodToJsonSchema(apiError("BAD_REQUEST")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const verify = {
    tags: ["Totp"],
    description: "Verify a 6-digit TOTP token",
    security: [{ cookieAuth: [] }],
    body: zodToJsonSchema(totpSchemas.totpBody),
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(apiError("BAD_REQUEST")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const update = {
    tags: ["Totp"],
    description: "Update 2FA secret",
    security: [{ cookieAuth: [] }],
    body: zodToJsonSchema(totpSchemas.totpUpdateBody),
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(apiError("BAD_REQUEST")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

const disable = {
    tags: ["Totp"],
    description: "Turn off 2FA",
    security: [{ cookieAuth: [] }],
    body: zodToJsonSchema(totpSchemas.totpBody),
    response: {
        200: zodToJsonSchema(apiSuccess(z.object({}))),
        400: zodToJsonSchema(apiError("BAD_REQUEST")),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("SERVER_ERROR")),
    },
};

export default { setup, verify, update, disable };
