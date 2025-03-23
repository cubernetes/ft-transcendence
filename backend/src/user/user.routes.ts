import type { FastifyPluginAsync } from "fastify";
import {
    getAllUsersHandler,
    getMeHandler,
    getUserByIdHandler,
    getUserByUsernameHandler,
    loginHandler,
    registerHandler,
} from "./user.controller.ts";
import { withZod } from "../utils/zod-validate.ts";
import {
    authenticationSchema,
    createRouteSchema,
    createUserSchema,
    getUserByIdRouteSchema,
    loginUserSchema,
    userIdSchema,
    userNameSchema,
} from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post(
        "/register",
        createRouteSchema,
        withZod({ body: createUserSchema }, registerHandler)
    );
    fastify.post("/login", withZod({ body: loginUserSchema }, loginHandler));
    fastify.get(
        "/id/:id",
        getUserByIdRouteSchema,
        withZod({ params: userIdSchema }, getUserByIdHandler)
    );
    fastify.get(
        "/username/:username",
        withZod({ params: userNameSchema }, getUserByUsernameHandler)
    );
    fastify.get("/all", getAllUsersHandler);
    fastify.get("/me", withZod({ headers: authenticationSchema }, getMeHandler));
    // fastify.put(
    //     "/:id",
    //     withZod(
    //         { params: userIdSchema, body: updateUserSchema, header: authenticationSchema },
    //         updateUserHandler
    //     )
    // );
    // fastify.remove(
    //     "/:id",
    //     withZod({ params: userIdSchema, header: authenticationSchema }, removeUserHandler)
    // );

    // "/me"?
};

export default userRoutes;
