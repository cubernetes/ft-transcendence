import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { totpRoutes } from "./totp.routes.ts";

const plugin = async (app: FastifyInstance) => {
    await app.register(totpRoutes, { prefix: "/totp" });
};

export const totpPlugin = fp(plugin, {
    name: "totp-plugin",
    dependencies: ["user-plugin"],
});
