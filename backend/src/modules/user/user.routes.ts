import type { FastifyPluginAsync } from "fastify";
import {
    getLeaderboardHandler,
    getMeHandler,
    loginHandler,
    registerHandler,
} from "./user.controller.ts";
import { withZod } from "../../utils/zod-validate.ts";
import {
    authenticationSchema,
    createRouteSchema,
    createUserSchema,
    leaderboardSchema,
    loginUserSchema,
} from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (app) => {
    app.post("/register", createRouteSchema, withZod({ body: createUserSchema }, registerHandler));
    app.post("/login", withZod({ body: loginUserSchema }, loginHandler));
    app.get("/me", withZod({ headers: authenticationSchema }, getMeHandler));

    app.get("/leaderboard/:n", withZod({ params: leaderboardSchema }, getLeaderboardHandler)); // Leaderboard, top x players?
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
