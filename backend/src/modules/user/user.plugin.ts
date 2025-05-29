import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { userRoutes } from "./user.routes.ts";
import { createUserService } from "./user.service.ts";

const plugin = async (app: FastifyInstance) => {
    app.decorate("userService", createUserService(app));

    await app.register(userRoutes, { prefix: "/user" });
};

export const userPlugin = fp(plugin, {
    name: "user-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
