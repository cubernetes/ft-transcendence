import fp from "fastify-plugin";
import { createUserService } from "./user.service";
import userRoutes from "./user.routes";
import type { FastifyInstance } from "fastify";

const userPlugin = async (fastify: FastifyInstance) => {
    fastify.decorate("userService", createUserService(fastify));

    await fastify.register(userRoutes, { prefix: "/users" });
};

export default fp(userPlugin, {
    name: "user-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
