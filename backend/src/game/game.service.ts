import type { FastifyInstance } from "fastify";
import { games } from "../db/db.schema";
import { NewGame, Game } from "./game.type";
import { eq } from "drizzle-orm";

export const createGameService = (fastify: FastifyInstance) => {
    const db = fastify.db;

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
    };
};
