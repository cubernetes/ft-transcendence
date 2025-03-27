import type { FastifyInstance } from "fastify";

export const createPongService = (app: FastifyInstance) => {
    const createGame = async (gameId: string) => {
        return gameId;
    };

    return { createGame };
};
