import type { FastifyInstance, WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";
import { UserInput } from "@darrenkuro/pong-core";
import { games } from "../../core/db/db.schema.ts";
import { UnknownError } from "../../utils/errors.ts";
import { Game, GameId, GameSession, NewGame, PongEngine } from "./game.types.ts";

export const createGameService = (app: FastifyInstance) => {
    const matchmakingQueue: WebSocket[] = []; // socket knows its own userId
    const gameSessions: Map<GameId, GameSession> = new Map();
    const db = app.db;

    const dequeuePlayer = (): Result<WebSocket, Error> => {
        const opponent = matchmakingQueue.shift();
        if (!opponent) {
            return err(new Error("No opponent found"));
        }
        return ok(opponent);
    };

    const tryGetOpponent = (conn: WebSocket): Result<WebSocket, Error> => {
        const opponent = dequeuePlayer();

        // Error means queue is empty, enqueue current socket
        if (opponent.isErr()) {
            matchmakingQueue.push(conn);
            return err(new Error("Empty Queue, waiting..."));
        }

        // If the both are the same player, rejoining to the queue
        if (opponent.value.userId === conn.userId) {
            matchmakingQueue.push(conn);
            return err(new Error("Same player, requeueing..."));
        }

        return ok(opponent.value);
    };

    const registerGameSession = (engine: PongEngine, players: WebSocket[]): string => {
        const id = uuidv4();

        const getTime = () => new Date().toISOString().slice(0, 19).replace("T", " ");

        gameSessions.set(id, { engine, players, createdAt: getTime() });
        return id;
    };

    const registerCbHandlers = (id: string): Result<void, Error> => {
        const session = gameSessions.get(id);
        if (!session || !session.engine || !session.players) {
            return err(new Error("Game session faulty when trying to register cb handlers"));
        }

        const { engine, players } = session;
        engine.onEvent("game-start", (_) => {
            // Assuming 2 players
            app.wsService.send(players[0], {
                type: "game-start",
                payload: {
                    gameId: id,
                    opponentId: players[1].userId!,
                    opponentName: players[1].userDisplayName!,
                    index: 0,
                },
            });

            app.wsService.send(players[1], {
                type: "game-start",
                payload: {
                    gameId: id,
                    opponentId: players[0].userId!,
                    opponentName: players[0].userDisplayName!,
                    index: 1,
                },
            });
        });

        engine.onEvent("game-end", (evt) => {
            app.wsService.broadcast(players, {
                type: "game-end",
                payload: evt,
            });
        });

        engine.onEvent("score-update", (evt) => {
            app.wsService.broadcast(players, {
                type: "score-update",
                payload: evt,
            });
        });

        engine.onEvent("wall-collision", (_) => {
            app.wsService.broadcast(players, {
                type: "wall-collision",
                payload: null,
            });
        });

        engine.onEvent("paddle-collision", (_) => {
            app.wsService.broadcast(players, {
                type: "paddle-collision",
                payload: null,
            });
        });

        engine.onEvent("state-update", (evt) => {
            app.wsService.broadcast(players, {
                type: "state-update",
                payload: evt,
            });
        });

        return ok();
    };

    const setUserInput = (id: string, i: number, action: UserInput): Result<void, Error> => {
        const session = gameSessions.get(id);
        if (!session || !session.engine || !session.players) {
            return err(new Error("Game session faulty when trying to set user input"));
        }

        session.engine.setInput(i, action);
        return ok();
    };

    /** Called when game ends */
    const saveGameById = async (id: string): Promise<Result<void, Error>> => {
        gameSessions.delete(id);
        return ok();
    };

    // This won't be called as HTTP API endpoint, so Error instead of Api Error
    const create = async (data: NewGame): Promise<Result<Game, Error>> => {
        try {
            const inserted = await db.insert(games).values(data).returning();
            const game = inserted[0];

            if (!game) {
                return err(new UnknownError("Failed to create game"));
            }

            return ok(game);
        } catch (error) {
            app.log.debug({ error }, "Failed to create game");
            return err(new UnknownError("Failed to create game"));
        }
    };

    return {
        saveGameById,
        create,
        tryGetOpponent,
        registerGameSession,
        registerCbHandlers,
        setUserInput,
    };
};
