import { z } from "zod";

export const errorCodeEnum = z.enum([
    "BAD_REQUEST",
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "PAYLOAD_TOO_LARGE",

    "USER_NOT_FOUND",
    "USERNAME_REQUIRED",
    "USERNAME_TAKEN",
    "USERNAME_TOO_SHORT",
    "DISPLAY_NAME_REQUIRED",
    "DISPLAY_NAME_TOO_SHORT",

    "PASSWORD_REQUIRED",
    "PASSWORD_INVALID",
    "PASSWORD_TOO_SHORT",
    "PASSWORD_MATCH_ERROR",

    "TOKEN_REQUIRED",
    "TOKEN_LENGTH_ERROR",
    "TOKEN_INVALID",

    "LOBBY_NOT_FOUND",
    "LOBBY_FULL",
    "ALREADY_IN_LOBBY",
    "NOT_IN_LOBBY",
    "GAME_STATUS_ERROR",

    "CORRUPTED_DATA",
    "SERVER_ERROR",
    "UNKNOWN_ERROR",
]);

export type ErrorCode = z.infer<typeof errorCodeEnum>;

// export const apiResponse = <T extends z.ZodTypeAny>(data: T) =>
//     z.discriminatedUnion("success", [apiSuccess(data), apiErrorSchema]);

export const apiResponse = <T extends z.ZodTypeAny>(data: T) =>
    z.union([apiSuccess(data), apiErrorSchema]);

export type ApiResponse<T extends z.ZodType<any, any, any>> = z.infer<
    ReturnType<typeof apiResponse<T>>
>;

// Type guard for narrowing down to success response
export const isApiResponseSuccess = <T extends z.ZodType<any, any, any>>(
    data: ApiResponse<T>
): data is ApiResponse<T> & { success: true } => {
    return data.success === true;
};

// Type guard for narrowing down to error response
export const isApiResponseError = <T extends z.ZodType<any, any, any>>(
    data: ApiResponse<T>
): data is ApiResponse<T> & { success: false } => {
    return data.success === false;
};

export const apiErrorSchema = z.object({
    success: z.literal(false),
    error: z.object({ code: errorCodeEnum }),
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
        error: z.object({ code: z.literal(code) }),
    });
