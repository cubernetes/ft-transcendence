import type { FastifyInstance, FastifyReply, FastifyRequest, WebSocket } from "fastify";
import { IncomingMessagePayloads, createPongEngine } from "@darrenkuro/pong-core";
import { CreateGameDTO, GameIdDTO } from "./game.types.ts";

export const handleGameStart =
    (app: FastifyInstance) =>
    (conn: WebSocket): void => {
        const opponent = app.gameService.tryGetOpponent(conn);
        if (opponent.isErr()) {
            return app.wsService.send(conn, {
                type: "waiting-for-opponent",
                payload: null,
            });
        }

        const engine = createPongEngine();
        const gameId = app.gameService.registerGameSession(engine, [opponent.value, conn]);
        app.gameService.registerCbHandlers(gameId);

        // Maybe hold off and don't start automatically
        engine.start();
    };

export const handleGameAction =
    (app: FastifyInstance) =>
    (_: WebSocket, payload: IncomingMessagePayloads["game-action"]): void => {
        const { gameId, index, action } = payload;
        app.gameService.setUserInput(gameId, index, action);
        // Update right away? Don't do anything and wait for game state to update automatically?
    };

export const createGameHandler = async (
    { body }: { body: CreateGameDTO },
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        //const game = await req.server.gameService.create(body);
        const game = body; // TODO

        if (!game) {
            return reply.code(400).send({ error: "Failed to create game" });
        }

        return reply.code(201).send(game);
    } catch (error) {
        req.log.error({ error }, "Failed to create game");
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

        if (!game) {
            return reply.code(404).send({ error: "Game not found" });
        }

        return reply.send(game);
    } catch (error) {
        req.log.error({ error }, "Failed to get game by ID");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getAllGamesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const games = await req.server.gameService.findAll();
        return reply.send(games);
    } catch (error) {
        req.log.error({ error }, "Failed to get all games");
        return reply.code(500).send({ error: "Internal server error" });
    }
};
