import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import swaggerPlugin from "./api.swagger.ts";
import { errorHandler, onSendHandler } from "./api.hooks.ts";

const apiPlugin = async (fastify: FastifyInstance) => {
    /** Register swagger and swagger-ui if not in production */
    if (process.env.NODE_ENV !== "production") {
        await fastify.register(swaggerPlugin);
    }

    fastify.setErrorHandler(errorHandler);
    fastify.addHook("onSend", onSendHandler);
};

export default fp(apiPlugin, { name: "api-plugin" });
