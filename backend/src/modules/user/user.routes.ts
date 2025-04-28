import type { FastifyPluginAsync } from "fastify";
import { userSchemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import controller from "./user.controller.ts";
import routeSchemas from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (app) => {
    // Register
    const registerOpts = { schema: routeSchemas.register }; // Schema for swagger UI
    const registerHandler = withZod({ body: userSchemas.registerBody }, controller.register);

    // Login
    const loginOpts = { schema: routeSchemas.login };
    const loginHandler = withZod({ body: userSchemas.loginBody }, controller.login);

    // Logout
    const logoutOpts = { preHandler: [app.requireAuth], schema: routeSchemas.logout };
    const logoutHandler = controller.logout;

    // Leaderboard
    const leaderboardOpts = { schema: routeSchemas.leaderboard };
    const leaderboardHandler = withZod(
        { params: userSchemas.leaderboardParams },
        controller.getLeaderboard
    );

    // Info
    const infoOpts = { schema: routeSchemas.info };
    const infoHandler = withZod({ params: userSchemas.infoParams }, controller.getInfo);

    // Me
    const meOpts = { preHandler: [app.requireAuth], schema: routeSchemas.me };
    const meHandler = controller.getMe;

    // Register routes
    app.post("/register", registerOpts, registerHandler);
    app.post("/login", loginOpts, loginHandler);
    app.post("/logout", logoutOpts, logoutHandler);
    app.get("/leaderboard/:n", leaderboardOpts, leaderboardHandler);
    app.get("/info/:username", infoOpts, infoHandler);
    app.get("/me", meOpts, meHandler);
};

export default userRoutes;
