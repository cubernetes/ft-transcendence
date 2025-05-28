import { z } from "zod";
import { ApiResponse } from "./schemas.api";
import { gameSchema } from "./schemas.game";

export type JwtPayload = z.infer<typeof jwtPayload>;
const jwtPayload = z.strictObject({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    iat: z.number(),
    exp: z.number(),
});

export const USERNAME_MIN_LENGTH = 4;
export const DISPLAY_NAME_MIN_LENGTH = 4;
export const PASSWORD_MIN_LENGTH = 8;

export type RegisterBody = z.infer<typeof registerBody>;
const registerBody = z
    .strictObject({
        username: z
            .string({ required_error: "USERNAME_REQUIRED" })
            .min(USERNAME_MIN_LENGTH, "USERNAME_TOO_SHORT"),
        displayName: z
            .string({ required_error: "DISPLAY_NAME_REQUIRED" })
            .min(DISPLAY_NAME_MIN_LENGTH, "DISPLAY_NAME_TOO_SHORT"),
        password: z
            .string({ required_error: "PASSWORD_REQUIRED" })
            .min(PASSWORD_MIN_LENGTH, "PASSWORD_TOO_SHORT"),
        confirmPassword: z
            .string({ required_error: "PASSWORD_REQUIRED" })
            .min(PASSWORD_MIN_LENGTH, "PASSWORD_TOO_SHORT"),
    })
    .refine((data) => data.password === data.confirmPassword, "PASSWORD_MATCH_ERROR");

export type LoginBody = z.infer<typeof loginBody>;
const loginBody = z.strictObject({
    username: z.string({ required_error: "USERNAME_REQUIRED" }),
    password: z.string({ required_error: "PASSWORD_REQUIRED" }),
    totpToken: z.string().length(6, "TOKEN_LENGTH_ERROR").optional(),
});

export type DisplayNameBody = z.infer<typeof displayNameBody>;
const displayNameBody = z.strictObject({
    displayName: z
        .string({ required_error: "DISPLAY_NAME_REQUIRED" })
        .min(DISPLAY_NAME_MIN_LENGTH, "DISPLAY_NAME_TOO_SHORT"),
});

export type PasswordBody = z.infer<typeof passwordBody>;
const passwordBody = z
    .strictObject({
        oldPassword: z.string({ required_error: "PASSWORD_REQUIRED" }),
        newPassword: z
            .string({ required_error: "PASSWORD_REQUIRED" })
            .min(PASSWORD_MIN_LENGTH, "PASSWORD_TOO_SHORT"),
        confirmPassword: z
            .string({ required_error: "PASSWORD_REQUIRED" })
            .min(PASSWORD_MIN_LENGTH, "PASSWORD_TOO_SHORT"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, "PASSWORD_MATCH_ERROR");

export type LeaderboardParams = z.infer<typeof leaderboardParams>;
const leaderboardParams = z.strictObject({ n: z.coerce.number().int().gt(0) });

export type LoginPayload = z.infer<typeof loginPayload>;
export type LoginResponse = ApiResponse<typeof loginPayload>;
const loginPayload = z.strictObject({
    username: z.string().optional(),
    displayName: z.string().optional(),
    totpEnabled: z.coerce.number().int().gte(0).optional(),
});

export type InfoParams = z.infer<typeof infoParams>;
const infoParams = z.strictObject({ username: z.string({ required_error: "USERNAME_REQUIRED" }) });

export type PublicUser = z.infer<typeof publicUser>;
const publicUser = z.strictObject({
    id: z.number(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().url(),
    wins: z.number(),
    losses: z.number(),
    totalGames: z.number(),
    createdAt: z.string().datetime(),
    rank: z.number(),
    games: gameSchema.publicGame.array(),
});

export type GetInfoPayload = z.infer<typeof getInfoPayload>;
export type GetInfoResponse = ApiResponse<typeof getInfoPayload>;
const getInfoPayload = publicUser;

export type PersonalUser = z.infer<typeof personalUser>;
const personalUser = publicUser.merge(z.strictObject({ totpEnabled: z.number() }));

export type GetMePayload = z.infer<typeof getMePayload>;
export type GetMeResponse = ApiResponse<typeof getMePayload>;
const getMePayload = personalUser;

export type LeaderboardPayload = z.infer<typeof leaderboardPayload>;
export type leaderboardResponse = ApiResponse<typeof leaderboardPayload>;
const leaderboardPayload = publicUser.array();

export type AvatarPayload = z.infer<typeof avatarPayload>;
const avatarPayload = z.strictObject({ avatarUrl: z.string() });

export const userSchema = {
    jwtPayload,
    registerBody,
    loginBody,
    displayNameBody,
    passwordBody,
    leaderboardParams,
    infoParams,
    getInfoPayload,
    publicUser,
    personalUser,
    getMePayload,
    loginPayload,
    leaderboardPayload,
    avatarPayload,
};
