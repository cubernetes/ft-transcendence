// import { FastifyInstance } from "fastify";
// import type { ServiceInstance } from "../../services";
// import TournamentController from "./tournament.controller";

// const tournamentRoutes = async (
//     fastify: FastifyInstance,
//     options: { service: ServiceInstance }
// ) => {
//     const controller = new TournamentController(options.service.tournament);

//     fastify.get(`/all`, controller.getAllTournaments.bind(controller));
//     fastify.get(`/:id`, controller.getTournamentById.bind(controller));
// };

// export default tournamentRoutes;
