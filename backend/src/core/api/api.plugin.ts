import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import swaggerPlugin from "./api.swagger.ts";

const apiPlugin = async (app: FastifyInstance) => {
    // Register swagger and swagger-ui if not in production
    if (process.env.NODE_ENV !== "production") {
        await app.register(swaggerPlugin);
    }
};

export default fp(apiPlugin, { name: "api-plugin", dependencies: ["config-plugin"] });
