import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import userRoutes from "./user.routes.ts";
import { createUserService } from "./user.service.ts";

const userPlugin = async (app: FastifyInstance) => {
    app.decorate("userService", createUserService(app));

    await app.register(userRoutes, { prefix: "/user" });
};

export default fp(userPlugin, {
    name: "user-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
