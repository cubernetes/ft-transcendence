import type { FastifyPluginAsync } from "fastify";
//import { createGameSchema, gameIdSchema } from "./game.types.ts";
import {} from // createGameHandler,
// getAllGamesHandler,
// getGameByIdHandler,
"./game.controller.ts";
// import { withZod } from "../../utils/zod-validate.ts";

const gameRoutes: FastifyPluginAsync = async (_) => {
    //app.post("/create", withZod({ body: createGameSchema }, createGameHandler));
    //app.get("/id/:id", withZod({ params: gameIdSchema }, getGameByIdHandler));
    //app.get("/all", getAllGamesHandler);
};

export default gameRoutes;
