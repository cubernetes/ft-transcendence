import type { FastifyInstance, WebSocket } from "fastify";
import { Result, err, ok } from "neverthrow";
import { eq } from "drizzle-orm";
import { games } from "../../core/db/db.schema.ts";
import { Game, GameId, NewGame, PongEngine } from "./game.types.ts";

// import { createPongEngine } from "@darrenkuro/pong-core";

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

        return ok(opponent.value);
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
        gameSessions,
        gamePlayers,
    };
};
