import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createAuthService } from "./auth.service.ts";

const authPlugin = async (app: FastifyInstance) => {
    app.decorateRequest("userId", -1); // Default -1 to always have a number type

    app.decorate("authService", createAuthService(app));
    app.decorate("requireAuth", app.authService.jwtAuth);
};

export default fp(authPlugin, {
    name: "auth-plugin",
    dependencies: ["@fastify/jwt"],
});
