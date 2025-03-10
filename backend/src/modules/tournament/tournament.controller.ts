import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateTournamentDTO, TournamentIdDTO, TournamentNameDTO } from "./tournament.type";

export const createTournamentHandler = async (
    { body }: { body: CreateTournamentDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        //const tournament = await req.server.tournamentService.create(body);
        const tournament = body; // TODO
        if (!tournament) return reply.code(400).send({ error: "Failed to create tournament" });
        return reply.code(201).send(tournament);
    } catch (error) {
        req.log.error({ err: error }, "Failed to create tournament");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getTournamentByIdHandler = async (
    { params }: { params: TournamentIdDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const tournament = await req.server.tournamentService.findById(params.id);
        if (!tournament) return reply.code(404).send({ error: "Tournament not found" });
        return reply.send(tournament);
    } catch (error) {
        req.log.error({ err: error }, "Failed to get tournament by ID");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getTournamentByNameHandler = async (
    { params }: { params: TournamentNameDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const tournament = await req.server.tournamentService.findByName(params.name);
        if (!tournament) return reply.code(404).send({ error: "Tournament not found" });
        return reply.send(tournament);
    } catch (error) {
        req.log.error({ err: error }, "Failed to get tournament by tournamentname");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getAllTournamentsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const tournaments = await req.server.tournamentService.findAll();
        return reply.send(tournaments);
    } catch (error) {
        req.log.error({ err: error }, "Failed to get all tournaments");
        return reply.code(500).send({ error: "Internal server error" });
    }
};
