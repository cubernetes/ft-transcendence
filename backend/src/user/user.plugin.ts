import type { FastifyInstance } from "fastify";
import { createUserService } from "./user.service.ts";
import userRoutes from "./user.routes.ts";
import fp from "fastify-plugin";

const userPlugin = async (fastify: FastifyInstance) => {
    fastify.decorate("userService", createUserService(fastify));

    await fastify.register(userRoutes, { prefix: "/users" });
};

export default fp(userPlugin, {
    name: "user-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
