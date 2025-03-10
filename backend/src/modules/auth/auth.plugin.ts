import fp from "fastify-plugin";
import { createAuthService } from "./auth.service";
import type { FastifyInstance } from "fastify";

const authPlugin = async (fastify: FastifyInstance) => {
    fastify.decorate("authService", createAuthService(fastify));
};

export default fp(authPlugin, {
    name: "auth-plugin",
    dependencies: ["@fastify/jwt"],
});
