import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import userRoutes from "./totp.routes.ts";

const totpPlugin = async (app: FastifyInstance) => {
    await app.register(userRoutes, { prefix: "/totp" });
};

export default fp(totpPlugin, {
    name: "totp-plugin",
    dependencies: ["user-plugin"],
});
