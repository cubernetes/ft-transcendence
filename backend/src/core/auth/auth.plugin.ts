import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createAuthService } from "./auth.service.ts";

const authPlugin = async (app: FastifyInstance) => {
    app.decorate("authService", createAuthService(app));

    // Always verify cookie and attach userId on Request
    app.addHook("onRequest", async (req, _) => {
        const { cookieName } = req.server.config;
        const token = req.cookies?.[cookieName];
        if (!token) return;

        const payload = req.server.authService.verifyJwtToken(token);
        if (payload.isOk() && payload.value.id && !isNaN(Number(payload.value.id))) {
            req.userId = Number(payload.value.id);
            req.username = payload.value.username;
            req.userDisplayName = payload.value.displayName;
        }
    });

    app.decorate("requireAuth", async (req, reply) => {
        if (!req.userId) reply.err("UNAUTHORIZED");
    });
};

export default fp(authPlugin, {
    name: "auth-plugin",
    dependencies: ["@fastify/jwt"],
});
