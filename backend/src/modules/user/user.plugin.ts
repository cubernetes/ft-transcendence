import type { FastifyInstance } from "fastify";
import { createUserService } from "./user.service.ts";
import userRoutes from "./user.routes.ts";
import fp from "fastify-plugin";

const userPlugin = async (app: FastifyInstance) => {
    app.decorate("userService", createUserService(app));

    await app.register(userRoutes, { prefix: "/users" });
};

export default fp(userPlugin, {
    name: "user-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
