import type { FastifyPluginAsync } from "fastify";
import {
    getLeaderboardHandler,
    getMeHandler,
    loginHandler,
    registerHandler,
} from "./user.controller.ts";
import { withZod } from "../../utils/zod-validate.ts";
import {
    registerRouteSchema,
    createUserSchema,
    leaderboardSchema,
    loginUserSchema,
    loginRouteSchema,
    getLeaderboardRouteSchema,
    getMeRouteSchema,
} from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (app) => {
    app.post(
        "/register",
        { schema: registerRouteSchema },
        withZod({ body: createUserSchema }, registerHandler)
    );
    app.post(
        "/login",
        { schema: loginRouteSchema },
        withZod({ body: loginUserSchema }, loginHandler)
    );
    app.get(
        "/me",
        { preHandler: [app.authService.jwtAuth], schema: getMeRouteSchema },
        getMeHandler
    );

    app.get(
        "/leaderboard/:n",
        { schema: getLeaderboardRouteSchema },
        withZod({ params: leaderboardSchema }, getLeaderboardHandler)
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
