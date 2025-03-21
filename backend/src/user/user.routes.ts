import type { FastifyPluginAsync } from "fastify";
import { createUserSchema, userIdSchema, userNameSchema } from "./user.types.ts";
import {
    createUserHandler,
    getAllUsersHandler,
    getUserByIdHandler,
    getUserByUsernameHandler,
} from "./user.controller.ts";
import { withZod } from "../utils/zod-validate.ts";
import { zodToJsonSchema } from "zod-to-json-schema";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post(
        "/create",
        { schema: { body: zodToJsonSchema(createUserSchema) } }, // Schema for swagger UI
        withZod({ body: createUserSchema }, createUserHandler)
    );
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
