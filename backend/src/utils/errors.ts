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
