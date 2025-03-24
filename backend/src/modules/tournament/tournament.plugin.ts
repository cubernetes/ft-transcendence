import type { FastifyInstance } from "fastify";
import { createTournamentService } from "./tournament.service.ts";
import tournamentRoutes from "./tournament.routes.ts";
import fp from "fastify-plugin";

const tournamentPlugin = async (fastify: FastifyInstance) => {
    fastify.decorate("tournamentService", createTournamentService(fastify));

    await fastify.register(tournamentRoutes, { prefix: "/tournaments" });
};

export default fp(tournamentPlugin, {
    name: "tournament-plugin",
    dependencies: ["db-plugin", "auth-plugin"],
});
