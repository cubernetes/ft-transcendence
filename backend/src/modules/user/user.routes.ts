import type { FastifyPluginAsync } from "fastify";
import { schemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import handlers from "./user.controller.ts";
import routeSchemas from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (app) => {
    app.post(
        "/register",
        { schema: routeSchemas.register },
        withZod({ body: schemas.registerBody }, handlers.register)
    );

    app.post(
        "/login",
        { schema: routeSchemas.login },
        withZod({ body: schemas.loginBody }, handlers.login)
    );

    app.get("/me", { preHandler: [app.requireAuth], schema: routeSchemas.me }, handlers.me);

    app.get(
        "/totpSetup",
        { preHandler: [app.requireAuth], schema: routeSchemas.totpSetup },
        handlers.totpSetup
    );

    app.post(
        "/totpVerifyInitial",
        { preHandler: [app.requireAuth], schema: routeSchemas.totpVerify },
        withZod({ body: schemas.totpInitialBody }, handlers.totpVerifyInitial)
    );

    app.post(
        "/totpVerify",
        { schema: routeSchemas.totpVerify },
        withZod({ body: schemas.totpBody }, handlers.totpVerify)
    );

    app.get(
        "/leaderboard/:n",
        { schema: routeSchemas.leaderboard },
        withZod({ params: schemas.leaderboardParams }, handlers.leaderboard)
    );
};

export default userRoutes;
