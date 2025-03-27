import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createPongService } from "./pong.service.ts";

const pongPlugin = async (app: FastifyInstance) => {
    app.decorate("pongService", createPongService(app));
};

export default fp(pongPlugin, { name: "pong-plugin" });
