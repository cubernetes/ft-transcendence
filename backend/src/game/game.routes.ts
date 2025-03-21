import type { FastifyPluginAsync } from "fastify";
import { createGameSchema, gameIdSchema } from "./game.types.ts";
import {
    createGameHandler,
    getAllGamesHandler,
    getGameByIdHandler,
    getGameConfigHandler,
} from "./game.controller.ts";
import { withZod } from "../utils/zod-validate.ts";

const gameRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/create", withZod({ body: createGameSchema }, createGameHandler));
    fastify.get("/id/:id", withZod({ params: gameIdSchema }, getGameByIdHandler));
    fastify.get("/all", getAllGamesHandler);
    fastify.get("/config", getGameConfigHandler);
};

export default gameRoutes;
