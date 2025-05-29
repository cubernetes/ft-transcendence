import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { ErrorCode } from "@darrenkuro/pong-core";
import { swaggerPlugin } from "./api.swagger.ts";

const STATUS = {
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    PAYLOAD_TOO_LARGE: 413,

    USER_NOT_FOUND: 404,
    USERNAME_REQUIRED: 400,
    USERNAME_TAKEN: 409,
    USERNAME_TOO_SHORT: 400,
    DISPLAY_NAME_REQUIRED: 400,
    DISPLAY_NAME_TOO_SHORT: 400,

    PASSWORD_REQUIRED: 400,
    PASSWORD_INVALID: 401,
    PASSWORD_TOO_SHORT: 400,
    PASSWORD_MATCH_ERROR: 400,

    TOKEN_REQUIRED: 400,
    TOKEN_LENGTH_ERROR: 400,
    TOKEN_INVALID: 401,

    LOBBY_NOT_FOUND: 404,
    LOBBY_FULL: 409,
    ALREADY_IN_LOBBY: 409,
    NOT_IN_LOBBY: 400,
    GAME_STATUS_ERROR: 400,

    CORRUPTED_DATA: 500,
    SERVER_ERROR: 500,
    UNKNOWN_ERROR: 500,
} as const satisfies Record<ErrorCode, number>;

const plugin = async (app: FastifyInstance) => {
    // Set up default falsy values for request
    app.decorateRequest("userId", 0);
    app.decorateRequest("username", "");
    app.decorateRequest("userDisplayName", "");

    // Decorate API functions on reply
    app.decorateReply(
        "ok",
        function (data: unknown, statusCode = 200, cookies?: { token: string }) {
            if (cookies) {
                const { cookieName, cookieConfig } = this.server.config;
                this.setCookie(cookieName, cookies.token, cookieConfig);
            }

            this.code(statusCode).send({ success: true, data });
        }
    );

    app.decorateReply("err", function (code: ErrorCode) {
        this.code(STATUS[code]).send({ success: false, error: { code } });
    });

    // Register swagger and swagger-ui if not in production
    if (process.env.NODE_ENV !== "production") {
        await app.register(swaggerPlugin);
    }
};

export const apiPlugin = fp(plugin, {
    name: "api-plugin",
    dependencies: ["config-plugin", "@fastify/cookie"],
});
