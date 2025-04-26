import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess, schemas } from "@darrenkuro/pong-core";

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

export default {
    totpSetup: getTotpSetupRouteSchema,
    totpVerify: getTotpVerifyRouteSchema,
};
