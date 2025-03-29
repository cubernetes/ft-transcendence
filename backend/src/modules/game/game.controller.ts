import type { FastifyInstance, FastifyReply, FastifyRequest, WebSocket } from "fastify";
import { CreateGameDTO, GameIdDTO } from "./game.types.ts";
import { createPongEngine, IncomingMessagePayloads } from "@darrenkuro/pong-core";
import { v4 as uuidv4 } from "uuid";

export const handleGameStart =
    (app: FastifyInstance) =>
    (conn: WebSocket, payload: IncomingMessagePayloads["game-start"]): void => {
        const { token } = payload;
        if (!token) {
            return app.log.error("Game start message has no token");
        }

        const userId = app.authService.verifyToken(token);
        if (userId.isErr()) {
            return app.log.error("Invalid token");
        }

        conn.userId = Number(userId.value.id);

        if (!app.gameService.hasWaitingPlayer()) {
            if (!app.gameService.hasWaitingPlayer()) {
                app.gameService.enqueuePlayer(conn);
                return app.wsService.send(conn, {
                    type: "waiting-for-opponent",
                    payload: null,
                });
            }

            const opponent = app.gameService.dequeuePlayer();
            if (opponent.isErr()) {
                return app.log.error({ err: opponent.error }, "Failed to dequeue player");
            }

            const gameEngine = createPongEngine();
            const gameId = uuidv4();
            app.gameService.gameSessions.set(gameId, gameEngine);
            app.gameService.gamePlayers.set(gameId, [opponent.value, conn]);
            gameEngine.start();

            if (!opponent.value.userId || !conn.userId) {
                return app.log.error("Opponent or connection has no user ID");
            }

            app.wsService.send(conn, {
                type: "game-start",
                payload: {
                    gameId,
                    opponentId: opponent.value.userId,
                },
            });

            app.wsService.send(opponent.value, {
                type: "game-start",
                payload: {
                    gameId,
                    opponentId: conn.userId,
                },
            });
        }
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
    } catch (e) {
        req.log.error({ err: e }, "Failed to create game");
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
    } catch (e) {
        req.log.error({ err: e }, "Failed to get game by ID");
        return reply.code(500).send({ error: "Internal server error" });
    }
};

export const getAllGamesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const games = await req.server.gameService.findAll();
        return reply.send(games);
    } catch (e) {
        req.log.error({ err: e }, "Failed to get all games");
        return reply.code(500).send({ error: "Internal server error" });
    }
};
