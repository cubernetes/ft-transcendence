import type { FastifyPluginAsync } from "fastify";
import { userSchemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import handlers from "./user.controller.ts";
import routeSchemas from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (app) => {
    app.post(
        "/register",
        { schema: routeSchemas.register },
        withZod({ body: userSchemas.registerBody }, handlers.register)
    );

    app.post(
        "/login",
        { schema: routeSchemas.login },
        withZod({ body: userSchemas.loginBody }, handlers.login)
    );

    // TODO: add Schema
    app.post("/logout", handlers.logout);

    app.get(
        "/leaderboard/:n",
        { schema: routeSchemas.leaderboard },
        withZod({ params: userSchemas.leaderboardParams }, handlers.leaderboard)
    );

    app.get("/me", { preHandler: [app.requireAuth], schema: routeSchemas.me }, handlers.me);
};

export default userRoutes;
