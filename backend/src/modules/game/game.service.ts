import type { FastifyInstance, WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { UserInput } from "@darrenkuro/pong-core";
import { games } from "../../core/db/db.schema.ts";
import { Game, GameId, NewGame, PongEngine } from "./game.types.ts";

export const createGameService = (app: FastifyInstance) => {
    const matchmakingQueue: WebSocket[] = []; // socket knows its own userId
    const gameSessions: Map<GameId, PongEngine> = new Map();
    const gamePlayers: Map<GameId, WebSocket[]> = new Map();
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

        gameSessions.set(id, engine);
        gamePlayers.set(id, players);
        return id;
    };

    const registerCbHandlers = (id: string): Result<void, Error> => {
        const engine = gameSessions.get(id);
        if (!engine) {
            return err(new Error("Couldn't find pong engine when trying to register cb handlers."));
        }
        const players = gamePlayers.get(id);
        if (!players) {
            return err(new Error("Couldn't find players"));
        }

        engine.onEvent("game-start", (_) => {
            // Assuming 2 players
            app.wsService.send(players[0], {
                type: "game-start",
                payload: {
                    gameId: id,
                    opponentId: players[1].userId!,
                    index: 0,
                },
            });

            app.wsService.send(players[1], {
                type: "game-start",
                payload: {
                    gameId: id,
                    opponentId: players[0].userId!,
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
        const engine = gameSessions.get(id);
        if (!engine) {
            return err(new Error("Couldn't find game when trying to set user input"));
        }
        engine.setInput(i, action);
        return ok();
    };

    const create = async (data: NewGame): Promise<Game | null> =>
        (await db.insert(games).values(data).returning())?.[0] || null;

    const findById = async (id: number): Promise<Game | null> =>
        (await db.select().from(games).where(eq(games.id, id)))?.[0] || null;

    const findAll = async (): Promise<Game[]> => await db.select().from(games);

    const update = async (id: number, data: Partial<Game>): Promise<Game | null> =>
        (await db.update(games).set(data).where(eq(games.id, id)).returning())?.[0] || null;

    const remove = async (id: number): Promise<Game | null> =>
        (await db.delete(games).where(eq(games.id, id)).returning())?.[0] || null;

    return {
        create,
        findById,
        findAll,
        update,
        remove,
        tryGetOpponent,
        registerGameSession,
        registerCbHandlers,
        setUserInput,
    };
};
