import type { ErrorCode } from "@darrenkuro/pong-core";
import type { FastifyInstance, FastifyReply } from "fastify";

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

    sendWithCookie(reply: FastifyReply, token: string, app: FastifyInstance) {
        const { cookieName, cookieConfig } = app.config;
        reply.setCookie(cookieName, token, cookieConfig).send({ success: true, data: this.data });
    }
}

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

export class ServerError extends ApiError {
    constructor(message = "Unknown error") {
        super("INTERNAL_SERVER_ERROR", 500, message);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = "Unknown error") {
        super("UNAUTHORIZED", 401, message);
    }
}

export const errUniqueConstraintOn = (err: unknown, column: string): boolean =>
    err instanceof Error && err.message.includes(`UNIQUE constraint failed: ${column}`);
