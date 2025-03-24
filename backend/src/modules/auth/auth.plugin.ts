import fp from "fastify-plugin";
import { createAuthService } from "./auth.service.ts";
import type { FastifyInstance } from "fastify";

const authPlugin = async (app: FastifyInstance) => {
    app.decorate("authService", createAuthService(app));
};

export default fp(authPlugin, {
    name: "auth-plugin",
    dependencies: ["@fastify/jwt"],
});
