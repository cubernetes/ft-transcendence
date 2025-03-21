import type { FastifyPluginAsync } from "fastify";
import {
    createUserHandler,
    getAllUsersHandler,
    getUserByIdHandler,
    getUserByUsernameHandler,
} from "./user.controller.ts";
import { withZod } from "../utils/zod-validate.ts";
import {
    createRouteSchema,
    createUserSchema,
    getUserByIdRouteSchema,
    userIdSchema,
    userNameSchema,
} from "./user.schema.ts";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post(
        "/create",
        createRouteSchema,
        withZod({ body: createUserSchema }, createUserHandler)
    );
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
