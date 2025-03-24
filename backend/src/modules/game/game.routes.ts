import type { FastifyPluginAsync } from "fastify";
import { createGameSchema, gameIdSchema } from "./game.types.ts";
import {
    createGameHandler,
    getAllGamesHandler,
    getGameByIdHandler,
    getGameConfigHandler,
} from "./game.controller.ts";
import { withZod } from "../../utils/zod-validate.ts";

const gameRoutes: FastifyPluginAsync = async (app) => {
    app.post("/create", withZod({ body: createGameSchema }, createGameHandler));
    app.get("/id/:id", withZod({ params: gameIdSchema }, getGameByIdHandler));
    app.get("/all", getAllGamesHandler);
    app.get("/config", getGameConfigHandler);
};

export default gameRoutes;
