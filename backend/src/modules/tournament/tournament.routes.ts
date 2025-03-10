import type { FastifyPluginAsync } from "fastify";
import {
    createTournamentSchema,
    tournamentIdSchema,
    tournamentNameSchema,
} from "./tournament.type";
import {
    createTournamentHandler,
    getAllTournamentsHandler,
    getTournamentByIdHandler,
    getTournamentByNameHandler,
} from "./tournament.controller";
import { withZod } from "../../utils/zod-validate";

const tournamentRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/create", withZod({ body: createTournamentSchema }, createTournamentHandler));
    fastify.get("/id/:id", withZod({ params: tournamentIdSchema }, getTournamentByIdHandler));
    fastify.get(
        "/name/:name",
        withZod({ params: tournamentNameSchema }, getTournamentByNameHandler)
    );
    fastify.get("/all", getAllTournamentsHandler);
};

export default tournamentRoutes;
