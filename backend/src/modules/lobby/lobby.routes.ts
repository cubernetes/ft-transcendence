import type { FastifyInstance } from "fastify";
import { withZod } from "../../utils/zod-validate.ts";
import controller from "./lobby.controller.ts";
import route from "./lobby.schema.ts";

const userRoutes = async (app: FastifyInstance) => {
    // Create
    const createOpts = { schema: route.register }; // Schema for swagger UI
    const createHandler = withZod({ body: userSchemas.registerBody }, controller.register);

    // Login
    const loginOpts = { schema: route.login };
    const loginHandler = withZod({ body: userSchemas.loginBody }, controller.login);

    // Logout
    const logoutOpts = { preHandler: [app.requireAuth], schema: route.logout };
    const logoutHandler = controller.logout;

    // Leaderboard
    const leaderboardOpts = { schema: route.getLeaderboard };
    const leaderboardHandler = withZod(
        { params: userSchemas.leaderboardParams },
        controller.getLeaderboard
    );

    // Info
    const infoOpts = { schema: route.getInfo };
    const infoHandler = withZod({ params: userSchemas.infoParams }, controller.getInfo);

    // Me
    const meOpts = { preHandler: [app.requireAuth], schema: route.getMe };
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
