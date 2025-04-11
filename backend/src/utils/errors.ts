import type { ErrorCode } from "@darrenkuro/pong-core";
import type { FastifyReply } from "fastify";

export class ApiError extends Error {
    constructor(
        public code: ErrorCode,
        public statusCode: number,
        public message: string
    ) {
        super(message);
    }

    send(reply: FastifyReply) {
        reply.code(this.statusCode).send({
            success: false,
            error: { code: this.code, message: this.message },
        });
    }
}

export class UnknownError extends ApiError {
    constructor(message = "Unknown error") {
        super("INTERNAL_SERVER_ERROR", 500, message);
    }
}

export const errUniqueConstraintOn = (err: unknown, column: string): boolean =>
    err instanceof Error && err.message.includes(`UNIQUE constraint failed: ${column}`);
