import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createAuthService, verifyCookie } from "./auth.service.ts";

const authPlugin = async (app: FastifyInstance) => {
    app.decorateRequest("userId", -1); // Default -1 to always have a number type

    app.decorate("authService", createAuthService(app));
    app.addHook("onRequest", verifyCookie); // Always verify cookie and attach userId
    app.decorate("requireAuth", app.authService.requireAuth);
};

export default fp(authPlugin, {
    name: "auth-plugin",
    dependencies: ["@fastify/jwt"],
});
