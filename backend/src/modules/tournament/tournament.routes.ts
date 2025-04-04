import type { FastifyPluginAsync } from "fastify";
import { withZod } from "../../utils/zod-validate.ts";
import {
    createTournamentHandler,
    getAllTournamentsHandler,
    getTournamentByIdHandler,
    getTournamentByNameHandler,
} from "./tournament.controller.ts";
import {
    createTournamentSchema,
    tournamentIdSchema,
    tournamentNameSchema,
} from "./tournament.types.ts";

const tournamentRoutes: FastifyPluginAsync = async (app) => {
    app.post("/create", withZod({ body: createTournamentSchema }, createTournamentHandler));
    app.get("/id/:id", withZod({ params: tournamentIdSchema }, getTournamentByIdHandler));
    app.get("/name/:name", withZod({ params: tournamentNameSchema }, getTournamentByNameHandler));
    app.get("/all", getAllTournamentsHandler);
};

export default tournamentRoutes;
