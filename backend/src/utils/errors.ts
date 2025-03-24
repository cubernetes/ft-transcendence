export type Result<T, E extends Error = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

export const ok = <T = void>(data?: T): Result<T> => ({
    success: true,
    data: data as T,
});

// Handles all of them here, take in unknown
export const error = <E extends Error>(error: E): Result<never, E> => {
    if (error instanceof Error) {
        return {
            success: false,
            error,
        };
    }

    return {
        success: false,
        error,
    };
};

export const ErrorCodes = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    USERNAME_TAKEN: "USERNAME_TAKEN",
    NOT_FOUND: "NOT_FOUND",
    UNAUTHORIZED: "UNAUTHORIZED",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class ApiError extends Error {
    constructor(
        public code: ErrorCode,
        public statusCode: number,
        public message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const errUniqueConstraintOn = (err: unknown, column: string): boolean =>
    err instanceof Error && err.message.includes(`UNIQUE constraint failed: ${column}`);
