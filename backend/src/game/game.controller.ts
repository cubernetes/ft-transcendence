import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateGameDTO, GameIdDTO } from "./game.type";

export const createGameHandler = async (
    { body }: { body: CreateGameDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        //const game = await req.server.gameService.create(body);
        const game = body; // TODO
        if (!game) return reply.code(400).send({ error: "Failed to create game" });
        return reply.code(201).send(game);
    } catch (error) {
        req.log.error({ err: error }, "Failed to create game");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getGameByIdHandler = async (
    { params }: { params: GameIdDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const game = await req.server.gameService.findById(params.id);
        if (!game) return reply.code(404).send({ error: "Game not found" });
        return reply.send(game);
    } catch (error) {
        req.log.error({ err: error }, "Failed to get game by ID");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getAllGamesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const games = await req.server.gameService.findAll();
        return reply.send(games);
    } catch (error) {
        req.log.error({ err: error }, "Failed to get all games");
        return reply.code(500).send({ error: "Internal server error" });
    }
};
