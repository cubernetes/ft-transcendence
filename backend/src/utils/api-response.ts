import type { ErrorCode } from "@darrenkuro/pong-core";
import type { FastifyReply } from "fastify";

// Deprecating entirely, deleting file
export class ApiSuccess<T> {
    constructor(
        public data: T,
        public statusCode: number = 200
    ) {}

    send(reply: FastifyReply) {
        reply.code(this.statusCode).send({
            success: true,
            data: this.data,
        });
    }

    sendWithCookie(reply: FastifyReply, token: string) {
        const { cookieName, cookieConfig } = reply.server.config;
        reply.setCookie(cookieName, token, cookieConfig).send({ success: true, data: this.data });
    }
}

export class ApiError extends Error {
    constructor(
        public code: ErrorCode,
        public statusCode: number,
        message?: string
    ) {
        // When instanstiated without message, use code as message
        super(message ?? code);
    }

    send(reply: FastifyReply) {
        reply.code(this.statusCode).send({
            success: false,
            error: { code: this.code, message: this.message },
        });
    }
}

export class ServerError extends ApiError {
    constructor(message = "Unknown error") {
        super("SERVER_ERROR", 500, message);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = "Unknown error") {
        super("UNAUTHORIZED", 401, message);
    }
}

export const errUniqueConstraintOn = (err: unknown, column: string): boolean =>
    err instanceof Error && err.message.includes(`UNIQUE constraint failed: ${column}`);
