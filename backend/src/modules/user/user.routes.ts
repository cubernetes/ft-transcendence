import type { FastifyInstance } from "fastify";
import { userSchema } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import { createUserController } from "./user.controller.ts";
import { routeSchema } from "./user.schema.ts";

export const userRoutes = async (app: FastifyInstance) => {
    const { register, login, logout, displayname, password, leaderboard, info, me, avatar } =
        createUserController(app);

    const { registerBody, loginBody, displayNameBody, passwordBody } = userSchema;
    const { leaderboardParams, infoParams } = userSchema;

    // Register routes
    app.post(
        "/register",
        { schema: routeSchema.register },
        withZod({ body: registerBody }, register)
    );

    app.post("/login", { schema: routeSchema.login }, withZod({ body: loginBody }, login));

    app.post("/logout", { preHandler: [app.requireAuth], schema: routeSchema.logout }, logout);

    app.post(
        "/displayname",
        { preHandler: [app.requireAuth] },
        withZod({ body: displayNameBody, schema: routeSchema.displayname }, displayname)
    );

    app.post(
        "/password",
        { preHandler: [app.requireAuth], schema: routeSchema.password },
        withZod({ body: passwordBody }, password)
    );

    app.get(
        "/leaderboard/:n",
        { schema: routeSchema.leaderboard },
        withZod({ params: leaderboardParams }, leaderboard)
    );

    app.get("/info/:username", { schema: routeSchema.info }, withZod({ params: infoParams }, info));

    app.get("/me", { preHandler: [app.requireAuth], schema: routeSchema.me }, me);

    app.post("/avatar", { preHandler: [app.requireAuth], schema: routeSchema.avatar }, avatar);
};
