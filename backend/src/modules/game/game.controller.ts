import type { FastifyInstance, FastifyReply, FastifyRequest, WebSocket } from "fastify";
import { IncomingMessagePayloads, createAIService, createPongEngine } from "@darrenkuro/pong-core";
import { CreateGameDTO, GameIdDTO } from "./game.types.ts";

// Create a single instance of the AI service to be used across the application
const pongAIService = createAIService();

export const handleGameStart =
    (app: FastifyInstance) =>
    (conn: WebSocket, payload: IncomingMessagePayloads["game-start"]): void => {
        const { token, playAgainstAI, aiDifficulty = "MEDIUM" } = payload;
        if (!token) {
            return app.log.error("Game start message has no token");
        }

        const userId = app.authService.verifyToken(token);
        if (userId.isErr()) {
            return app.log.error("Invalid token");
        }

        conn.userId = Number(userId.value.id);

        if (playAgainstAI) {
            // Create a game with an AI opponent
            app.log.info(`Creating game with AI opponent for user ${conn.userId}`);

            const engine = createPongEngine();

            // Register game session (player is always index 0, AI is index 1)
            const gameId = app.gameService.registerGameSession(engine, [conn]);
            app.gameService.registerCbHandlers(gameId);

            // Create the AI player using the pong AI service directly
            pongAIService.createAIPlayer(engine, 1, aiDifficulty);
            app.log.info(`AI player created for game ${gameId} with difficulty ${aiDifficulty}`);

            // Send game start message to human player
            app.wsService.send(conn, {
                type: "game-start",
                payload: {
                    gameId,
                    opponentId: 0, // AI doesn't have a real userId
                    index: 0, // Human player is always index 0
                    isAI: true,
                    aiDifficulty,
                },
            });

            engine.start();
            return;
        }

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
