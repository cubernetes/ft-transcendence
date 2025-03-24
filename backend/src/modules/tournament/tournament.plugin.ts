import type { FastifyInstance } from "fastify";
import { createTournamentService } from "./tournament.service.ts";
import tournamentRoutes from "./tournament.routes.ts";
import fp from "fastify-plugin";

const tournamentPlugin = async (app: FastifyInstance) => {
    app.decorate("tournamentService", createTournamentService(app));

    await app.register(tournamentRoutes, { prefix: "/tournaments" });
};

export default fp(tournamentPlugin, {
    name: "tournament-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
