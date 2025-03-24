import { z } from "zod";

export const resSuccess = <T extends z.ZodTypeAny>(data: T) =>
    z.object({
        success: z.literal(true),
        data,
    });

export const resError = <T extends [string, ...string[]]>(codes: T) =>
    z.object({
        success: z.literal(false),
        error: z.object({
            message: z.string(),
            code: z.enum(codes),
        }),
    });
