import type { FastifyInstance } from "fastify";
import { userSchemas as schemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import { createUserController } from "./user.controller.ts";
import route from "./user.schema.ts";

export const userRoutes = async (app: FastifyInstance) => {
    const controller = createUserController(app);

    // Deconstruct to get shorten variable names
    const { registerBody, loginBody, leaderboardParams, infoParams } = schemas;
    const { register, login, logout, leaderboard, info, me } = controller;

    // Register
    const registerOpts = { schema: route.register }; // Schema for swagger UI
    const registerHandler = withZod({ body: registerBody }, register);

    // Login
    const loginOpts = { schema: route.login };
    const loginHandler = withZod({ body: loginBody }, login);

    // Logout
    const logoutOpts = { preHandler: [app.requireAuth], schema: route.logout };
    const logoutHandler = logout;

    // Leaderboard
    const leaderboardOpts = { schema: route.getLeaderboard };
    const leaderboardHandler = withZod({ params: leaderboardParams }, leaderboard);

    // Info
    const infoOpts = { schema: route.getInfo };
    const infoHandler = withZod({ params: infoParams }, info);

    // Me
    const meOpts = { preHandler: [app.requireAuth], schema: route.getMe };
    const meHandler = me;

    // Register routes
    app.post("/register", registerOpts, registerHandler);
    app.post("/login", loginOpts, loginHandler);
    app.post("/logout", logoutOpts, logoutHandler);
    app.get("/leaderboard/:n", leaderboardOpts, leaderboardHandler);
    app.get("/info/:username", infoOpts, infoHandler);
    app.get("/me", meOpts, meHandler);
};
