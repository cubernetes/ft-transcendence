import { z } from "zod";
import { ApiResponse } from "./schemas.api";

const jwtPayload = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    iat: z.number(),
    exp: z.number(),
});

const registerBody = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters long"),
        displayName: z
            .string()
            .min(3, { message: "Display name must be at least 3 characters long" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
        confirmPassword: z
            .string()
            .min(8, { message: "Confirm password must be at least 8 characters long" }),
    })
    .refine((data) => data.password === data.confirmPassword, "Passwords do not match");

const loginBody = z.object({
    username: z.string().min(3, { message: "Username is required" }),
    password: z.string().min(8, { message: "Password is required" }),
});

const totpBody = z.object({
    token: z
        .string({ required_error: "Token is required" })
        .length(6, { message: "Token must be 6 characters" }),
    username: z.string({ required_error: "Username is required" }),
});

const totpInitialBody = z.object({
    // TODO: make it exact instead of min(6)
    token: z.string().min(6, { message: "Token must 6 character required" }),
});

const leaderboardParams = z.object({ n: z.coerce.number().int().gt(0) });

const publicUser = z.object({
    id: z.number(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().url(),
    wins: z.number(),
    losses: z.number(),
    createdAt: z.string().datetime(),
});

const loginPayload = z.object({
    username: z.string(),
    displayName: z.string(),
    totpEnabled: z.coerce.number().int().gte(0),
});

const totpSetupPayload = z.object({
    qrCode: z.string(),
    b32secret: z.string(),
});

const totpVerifyPayload = z.object({ username: z.string(), displayName: z.string() });

const getMePayload = publicUser;
// const getMeResponse = apiResponse(publicUser);
// const loginResponse = apiResponse(loginPayload);
const leaderboardPayload = publicUser.array();
// const leaderboardResponse = apiResponse(leaderboardPayload);
// const totpSetupResponse = apiResponse(totpSetupPayload);
// const totpVerifyResponse = apiResponse(totpVerifyPayload);

export const schemas = {
    jwtPayload,
    registerBody,
    loginBody,
    totpBody,
    totpInitialBody,
    leaderboardParams,
    publicUser,
    getMePayload,
    loginPayload,
    leaderboardPayload,
    totpSetupPayload,
    totpVerifyPayload,
    // getMeResponse,
    // loginResponse,
    // leaderboardResponse,
    // totpSetupResponse,
    // totpVerifyResponse,
};

export type JwtPayload = z.infer<typeof schemas.jwtPayload>;
export type RegisterBody = z.infer<typeof schemas.registerBody>;
export type LoginBody = z.infer<typeof schemas.loginBody>;
export type TotpBody = z.infer<typeof schemas.totpBody>;
export type TotpInitialBody = z.infer<typeof schemas.totpInitialBody>;
export type LeaderboardParams = z.infer<typeof schemas.leaderboardParams>;
export type PublicUser = z.infer<typeof schemas.publicUser>;
export type GetMePayload = z.infer<typeof schemas.getMePayload>;
export type GetMeResponse = ApiResponse<typeof schemas.getMePayload>;
export type LoginPayload = z.infer<typeof schemas.loginPayload>;
export type LoginResponse = ApiResponse<typeof schemas.loginPayload>;
export type LeaderboardPayload = z.infer<typeof schemas.leaderboardPayload>;
export type leaderboardResponse = ApiResponse<typeof schemas.leaderboardPayload>;
export type TotpSetupPayload = z.infer<typeof schemas.totpSetupPayload>;
export type TotpSetupResponse = ApiResponse<typeof schemas.totpSetupPayload>;
export type TotpVerifyPayload = z.infer<typeof schemas.totpVerifyPayload>;
export type TotpVerifyResponse = ApiResponse<typeof schemas.totpVerifyPayload>;
