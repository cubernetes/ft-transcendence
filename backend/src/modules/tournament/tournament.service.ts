import type { FastifyInstance } from "fastify";
import { tournaments } from "../db/db.schema";
import { NewTournament, Tournament } from "./tournament.type";
import { eq } from "drizzle-orm";

export const createTournamentService = (fastify: FastifyInstance) => {
    const db = fastify.db;

    const create = async (data: NewTournament): Promise<Tournament | null> =>
        (await db.insert(tournaments).values(data).returning())?.[0] || null;

    const findById = async (id: number): Promise<Tournament | null> =>
        (await db.select().from(tournaments).where(eq(tournaments.id, id)))?.[0] || null;

    const findByName = async (name: string): Promise<Tournament | null> =>
        (await db.select().from(tournaments).where(eq(tournaments.name, name)))?.[0] || null;

    const findAll = async (): Promise<Tournament[]> => await db.select().from(tournaments);

    const update = async (id: number, data: Partial<Tournament>): Promise<Tournament | null> =>
        (await db.update(tournaments).set(data).where(eq(tournaments.id, id)).returning())?.[0] ||
        null;

    const remove = async (id: number): Promise<Tournament | null> =>
        (await db.delete(tournaments).where(eq(tournaments.id, id)).returning())?.[0] || null;

    return {
        create,
        findById,
        findByName,
        findAll,
        update,
        remove,
    };
};
