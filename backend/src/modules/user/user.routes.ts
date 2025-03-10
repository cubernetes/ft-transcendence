import type { FastifyPluginAsync } from "fastify";
import { createUserSchema, userIdSchema, userNameSchema } from "./user.type";
import {
    createUserHandler,
    getAllUsersHandler,
    getUserByIdHandler,
    getUserByUsernameHandler,
} from "./user.controller";
import { withZod } from "../../utils/zod-validate";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/create", withZod({ body: createUserSchema }, createUserHandler));
    fastify.get("/id/:id", withZod({ params: userIdSchema }, getUserByIdHandler));
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
