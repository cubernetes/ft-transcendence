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
import { withZod } from "../../utils/zod-validate.ts";

const tournamentRoutes: FastifyPluginAsync = async (app) => {
    app.post("/create", withZod({ body: createTournamentSchema }, createTournamentHandler));
    app.get("/id/:id", withZod({ params: tournamentIdSchema }, getTournamentByIdHandler));
    app.get("/name/:name", withZod({ params: tournamentNameSchema }, getTournamentByNameHandler));
    app.get("/all", getAllTournamentsHandler);
};

export default tournamentRoutes;
