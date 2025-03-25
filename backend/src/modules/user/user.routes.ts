import type { FastifyPluginAsync } from "fastify";
import handlers from "./user.controller.ts";
import { withZod } from "../../utils/zod-validate.ts";
import schemas from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (app) => {
    app.post(
        "/register",
        { schema: schemas.routes.register },
        withZod({ body: schemas.registerBody }, handlers.register)
    );

    app.post(
        "/login",
        { schema: schemas.routes.login },
        withZod({ body: schemas.loginBody }, handlers.login)
    );

    app.get("/me", { preHandler: [app.requireAuth], schema: schemas.routes.me }, handlers.me);

    app.get(
        "/leaderboard/:n",
        { schema: schemas.routes.leaderboard },
        withZod({ params: schemas.leaderboardParams }, handlers.leaderboard)
    );

    // These endpoints are acutally stupid, controller should be used for more direct things for frontend
    // app.get(
    //     "/id/:id",
    //     getUserByIdRouteSchema,
    //     withZod({ params: userIdSchema }, getUserByIdHandler)
    // );
    // app.get(
    //     "/username/:username",
    //     withZod({ params: userNameSchema }, getUserByUsernameHandler)
    // );
    // app.put(
    //     "/:id",
    //     withZod(
    //         { params: userIdSchema, body: updateUserSchema, header: authenticationSchema },
    //         updateUserHandler
    //     )
    // );
};

export default userRoutes;
