import type { FastifyInstance } from "fastify";
import { userSchemas as schemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import { createUserController } from "./user.controller.ts";
import route from "./user.schema.ts";

export const userRoutes = async (app: FastifyInstance) => {
    const controller = createUserController(app);

    // Deconstruct to get shorten variable names
    const {
        registerBody,
        loginBody,
        displayNameBody,
        passwordBody,
        leaderboardParams,
        infoParams,
    } = schemas;
    const { register, login, logout, displayName, password, leaderboard, info, me, avatar } =
        controller;

    // Register
    const registerOpts = { schema: route.register }; // Schema for swagger UI
    const registerHandler = withZod({ body: registerBody }, register);

    // Login
    const loginOpts = { schema: route.login };
    const loginHandler = withZod({ body: loginBody }, login);

    // Logout
    const logoutOpts = { preHandler: [app.requireAuth], schema: route.logout };
    const logoutHandler = logout;

    // Display name
    const displayNameOpts = { preHandler: [app.requireAuth] };
    const displayNameHandler = withZod({ body: displayNameBody }, displayName);

    // Password
    const passwordOpts = { preHandler: [app.requireAuth] };
    const passwordHandler = withZod({ body: passwordBody }, password);

    // Leaderboard
    const leaderboardOpts = { schema: route.getLeaderboard };
    const leaderboardHandler = withZod({ params: leaderboardParams }, leaderboard);

    // Info
    const infoOpts = { schema: route.getInfo };
    const infoHandler = withZod({ params: infoParams }, info);

    // Me
    const meOpts = { preHandler: [app.requireAuth], schema: route.getMe };
    const meHandler = me;

    // Avatar
    const avatarOpts = { preHandler: [app.requireAuth] };
    const avatarHandler = avatar;

    // Register routes
    app.post("/register", registerOpts, registerHandler);
    app.post("/login", loginOpts, loginHandler);
    app.post("/logout", logoutOpts, logoutHandler);
    app.post("/displayname", displayNameOpts, displayNameHandler);
    app.post("/password", passwordOpts, passwordHandler);
    app.get("/leaderboard/:n", leaderboardOpts, leaderboardHandler);
    app.get("/info/:username", infoOpts, infoHandler);
    app.get("/me", meOpts, meHandler);
    app.post("/avatar", avatarOpts, avatarHandler);
};
