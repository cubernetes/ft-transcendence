import { z } from "zod";

export const errorCodeEnum = z.enum([
    "VALIDATION_ERROR",
    "USERNAME_TAKEN",
    "NOT_FOUND",
    "UNAUTHORIZED",
    "INTERNAL_SERVER_ERROR",
]);

export const apiSuccess = <T extends z.ZodTypeAny>(data: T) =>
    z.object({
        success: z.literal(true),
        data,
    });

// export const apiError = <T extends [string, ...string[]]>(codes: T) =>
//     z.object({
//         success: z.literal(false),
//         error: z.object({
//             message: z.string(),
//             code: z.enum(codes),
//         }),
//     });

export type ErrorCode = z.infer<typeof errorCodeEnum>;

export const apiError = <T extends ErrorCode>(code: T) =>
    z.object({
        success: z.literal(false),
        error: z.object({
            message: z.string(),
            code: z.literal(code),
        }),
    });
