import { z } from "zod";

export const errorCodeEnum = z.enum([
    "BAD_REQUEST",
    "VALIDATION_ERROR",
    "USERNAME_TAKEN",
    "NOT_FOUND",
    "UNAUTHORIZED",
    "INTERNAL_SERVER_ERROR",
]);

export type ErrorCode = z.infer<typeof errorCodeEnum>;

// export const apiResponse = <T extends z.ZodTypeAny>(data: T) =>
//     z.discriminatedUnion("success", [apiSuccess(data), apiErrorSchema]);

export const apiResponse = <T extends z.ZodTypeAny>(data: T) =>
    z.union([apiSuccess(data), apiErrorSchema]);

export type ApiResponse<T extends z.ZodType<any, any, any>> = z.infer<
    ReturnType<typeof apiResponse<T>>
>;

export const apiErrorSchema = z.object({
    success: z.literal(false),
    error: z.object({
        message: z.string(),
        code: errorCodeEnum,
    }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const apiSuccess = <T extends z.ZodTypeAny>(data: T) =>
    z.object({
        success: z.literal(true),
        data,
    });

export const apiError = <T extends ErrorCode>(code: T) =>
    z.object({
        success: z.literal(false),
        error: z.object({
            message: z.string(),
            code: z.literal(code),
        }),
    });
