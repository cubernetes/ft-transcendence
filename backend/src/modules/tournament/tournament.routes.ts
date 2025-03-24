import type { FastifyPluginAsync } from "fastify";
import {
    createTournamentSchema,
    tournamentIdSchema,
    tournamentNameSchema,
} from "./tournament.types.ts";
import {
    createTournamentHandler,
    getAllTournamentsHandler,
    getTournamentByIdHandler,
    getTournamentByNameHandler,
} from "./tournament.controller.ts";
import { withZod } from "../utils/zod-validate.ts";

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
