// import { FastifyInstance } from "fastify";
// import type { ServiceInstance } from "../../services";
// import GameController from "./game.controller";

// const gameRoutes = async (fastify: FastifyInstance, options: { service: ServiceInstance }) => {
//     const controller = new GameController(options.service.game);

//     fastify.get(`/all`, controller.getAllGames.bind(controller));
//     fastify.get(`/:id`, controller.getGameById.bind(controller));
// };

// export default gameRoutes;
