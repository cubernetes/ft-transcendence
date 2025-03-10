import { users } from "../db/db.schema";
import { NewUser, User } from "./user.type";
import { eq } from "drizzle-orm";
import { FastifyInstance } from "fastify/types/instance";

export const createUserService = (fastify: FastifyInstance) => {
    const db = fastify.db;

    const create = async (data: NewUser) =>
        (await db.insert(users).values(data).returning())?.[0] || null;

    const findById = async (id: number) =>
        (await db.select().from(users).where(eq(users.id, id)))?.[0] || null;

    const findByUsername = async (username: string) =>
        (await db.select().from(users).where(eq(users.username, username)))?.[0] || null;

    const findAll = () => db.select().from(users);

    const update = async (id: number, data: Partial<User>) =>
        (await db.update(users).set(data).where(eq(users.id, id)).returning())?.[0] || null;

    const remove = async (id: number) =>
        (await db.delete(users).where(eq(users.id, id)).returning())?.[0] || null;

    return {
        create,
        findById,
        findByUsername,
        findAll,
        update,
        remove,
    };
};
