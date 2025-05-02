import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { ErrorCode } from "@darrenkuro/pong-core";
import swaggerPlugin from "./api.swagger.ts";

const STATUS = {
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    INVALID_PASSWORD: 401,
    INVALID_TOTP_TOKEN: 401,
    NOT_FOUND: 404,
    USERNAME_TAKEN: 409,
    LOBBY_FULL: 409,
    ALREADY_IN_LOBBY: 409,
    NOT_IN_LOBBY: 400,
    GAME_STATUS_ERROR: 400,
    CORRUPTED_DATA: 500,
    SERVER_ERROR: 500,
} as const satisfies Record<ErrorCode, number>;

const apiPlugin = async (app: FastifyInstance) => {
    // Set up default falsy values for request
    app.decorateRequest("userId", 0);
    app.decorateRequest("username", "");
    app.decorateRequest("userDisplayName", "");

    // Decorate api functions on reply
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

export default fp(apiPlugin, {
    name: "api-plugin",
    dependencies: ["config-plugin", "@fastify/cookie"],
});
