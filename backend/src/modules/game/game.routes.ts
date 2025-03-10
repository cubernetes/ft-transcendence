import type { FastifyPluginAsync } from "fastify";
import { createGameSchema, gameIdSchema } from "./game.type";
import { createGameHandler, getAllGamesHandler, getGameByIdHandler } from "./game.controller";
import { withZod } from "../../utils/zod-validate";

const gameRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/create", withZod({ body: createGameSchema }, createGameHandler));
    fastify.get("/id/:id", withZod({ params: gameIdSchema }, getGameByIdHandler));
    fastify.get("/all", getAllGamesHandler);
};

export default gameRoutes;
