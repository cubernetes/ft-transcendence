import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { apiError, apiSuccess } from "../../core/api/api.schema.ts";

const registerBodySchema = z
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

const loginBodySchema = z.object({
    username: z.string().min(3, { message: "Username is required" }),
    password: z.string().min(8, { message: "Password is required" }),
});

const totpBodySchema = z.object({
    // TODO: make it exact instead of min(6)
    token: z.string().min(6, { message: "Token must be 6 characters" }),
    username: z.string(),
});

const totpBodyInitialSchema = z.object({
    // TODO: make it exact instead of min(6)
    token: z.string().min(6, { message: "Token must 6 character required" }),
});

const leaderboardParamsSchema = z.object({
    n: z.coerce.number().int().gt(0),
});

const PublicUserSchema = z.object({
    id: z.number(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().url(),
    wins: z.number(),
    losses: z.number(),
    createdAt: z.string().datetime(),
});

const TotpQrCodeSchema = z.object({
    qrCode: z.string(),
    b32secret: z.string(),
});

const LoginResponseSchema = z.object({
    token: z.string(),
    totpEnabled: z.coerce.number().int().gte(0),
});

const TotpVerifyResponseSchema = z.object({
    token: z.string(),
});

/** Schemas for swagger UI */
const registerRouteSchema = {
    tags: ["User"],
    description: "Register a new user",
    body: zodToJsonSchema(registerBodySchema),
    response: {
        201: zodToJsonSchema(apiSuccess(LoginResponseSchema)),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        409: zodToJsonSchema(apiError("USERNAME_TAKEN")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const loginRouteSchema = {
    tags: ["User"],
    description: "Login an user",
    body: zodToJsonSchema(loginBodySchema),
    response: {
        201: zodToJsonSchema(apiSuccess(LoginResponseSchema)),
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
        200: zodToJsonSchema(apiSuccess(PublicUserSchema)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const getTotpSetupRouteSchema = {
    tags: ["User"],
    description: "Get the data URI for a QR code image to provision the TOTP 2FA",
    security: [{ bearerAuth: [] }],
    response: {
        200: zodToJsonSchema(apiSuccess(TotpQrCodeSchema)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const getTotpVerifyRouteSchema = {
    tags: ["User"],
    description: "Verify a 6-digit TOTP token",
    response: {
        200: zodToJsonSchema(apiSuccess(TotpVerifyResponseSchema)),
        401: zodToJsonSchema(apiError("UNAUTHORIZED")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

const getLeaderboardRouteSchema = {
    tags: ["User"],
    description: "Get top n users by wins",
    params: zodToJsonSchema(leaderboardParamsSchema),
    response: {
        200: zodToJsonSchema(apiSuccess(PublicUserSchema.array())),
        400: zodToJsonSchema(apiError("VALIDATION_ERROR")),
        500: zodToJsonSchema(apiError("INTERNAL_SERVER_ERROR")),
    },
};

export default {
    registerBody: registerBodySchema,
    loginBody: loginBodySchema,
    totpBody: totpBodySchema,
    totpBodyInitial: totpBodyInitialSchema,
    leaderboardParams: leaderboardParamsSchema,
    loginResponse: LoginResponseSchema,
    publicUser: PublicUserSchema,
    routes: {
        register: registerRouteSchema,
        login: loginRouteSchema,
        me: getMeRouteSchema,
        totpSetup: getTotpSetupRouteSchema,
        totpVerify: getTotpVerifyRouteSchema,
        leaderboard: getLeaderboardRouteSchema,
    },
};
