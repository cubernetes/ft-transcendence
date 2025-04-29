import { z } from "zod";
import { ApiResponse } from "./schemas.api";

export type TotpBody = z.infer<typeof totpBody>;
const totpBody = z.object({
    token: z
        .string({ required_error: "Token is required" })
        .length(6, "Token must be 6 characters"),
});

export type TotpUpdateBody = z.infer<typeof totpUpdateBody>;
const totpUpdateBody = z.object({
    token: z
        .string({ required_error: "Token is required" })
        .length(6, "Token must be 6 characters"),
    newToken: z
        .string({ required_error: "Token is required" })
        .length(6, "Token must be 6 characters"),
});

export type TotpSetupPayload = z.infer<typeof setupPayload>;
export type TotpSetupResponse = ApiResponse<typeof setupPayload>;
const setupPayload = z.object({
    qrCode: z.string(),
    secret: z.string(),
});

export const totpSchemas = {
    totpBody,
    totpUpdateBody,
    setupPayload,
};
