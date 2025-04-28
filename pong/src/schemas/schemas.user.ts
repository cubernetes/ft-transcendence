import { z } from "zod";
import { ApiResponse } from "./schemas.api";
import { gameSchemas } from "./schemas.game";

export type JwtPayload = z.infer<typeof jwtPayload>;
const jwtPayload = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    iat: z.number(),
    exp: z.number(),
});

export type RegisterBody = z.infer<typeof registerBody>;
const registerBody = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters long"),
        displayName: z.string().min(3, "Display name must be at least 3 characters long"),
        password: z.string().min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),
    })
    .refine((data) => data.password === data.confirmPassword, "Passwords do not match");

export type LoginBody = z.infer<typeof loginBody>;
const loginBody = z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }),
    totpToken: z.string().length(6, "Token must be 6 characters").optional(),
});

export type LeaderboardParams = z.infer<typeof leaderboardParams>;
const leaderboardParams = z.object({ n: z.coerce.number().int().gt(0) });

export type LoginPayload = z.infer<typeof loginPayload>;
export type LoginResponse = ApiResponse<typeof loginPayload>;
const loginPayload = z.object({
    username: z.string().optional(),
    displayName: z.string().optional(),
    totpEnabled: z.coerce.number().int().gte(0).optional(),
});

export type InfoParams = z.infer<typeof infoParams>;
const infoParams = z.object({ username: z.string({ required_error: "Username is required" }) });

export type PublicUser = z.infer<typeof publicUser>;
const publicUser = z.object({
    id: z.number(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().url(),
    wins: z.number(),
    losses: z.number(),
    totalGames: z.number(),
    createdAt: z.string().datetime(),
    rank: z.number(),
    games: gameSchemas.publicGame.array(),
});

export type GetMePayload = z.infer<typeof getMePayload>;
export type GetMeResponse = ApiResponse<typeof getMePayload>;
const getMePayload = publicUser;

export type LeaderboardPayload = z.infer<typeof leaderboardPayload>;
export type leaderboardResponse = ApiResponse<typeof leaderboardPayload>;
const leaderboardPayload = publicUser.array();

export const userSchemas = {
    jwtPayload,
    registerBody,
    loginBody,
    leaderboardParams,
    infoParams,
    publicUser,
    getMePayload,
    loginPayload,
    leaderboardPayload,
};
