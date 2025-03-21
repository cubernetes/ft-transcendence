import type { FastifyInstance } from "fastify";
import { users } from "../db/db.schema.ts";
import { NewUser, User } from "./user.types.ts";
import { eq } from "drizzle-orm";
import { ApiError, errUniqueConstraintOn } from "../utils/errors.ts";

export const createUserService = (fastify: FastifyInstance) => {
    const db = fastify.db;

    const create = async (data: NewUser): Promise<User> => {
        try {
            const user = (await db.insert(users).values(data).returning())?.[0];
            return user;
        } catch (err) {
            if (errUniqueConstraintOn(err, "users.username")) {
                throw new ApiError("USERNAME_TAKEN", 409, "Username already taken");
            }

            throw new ApiError("INTERNAL_SERVER_ERROR", 500, "Failed to create user");
        }
    };

    const findById = async (id: number): Promise<User | null> =>
        (await db.select().from(users).where(eq(users.id, id)))?.[0] || null;

    const findByUsername = async (username: string): Promise<User | null> =>
        (await db.select().from(users).where(eq(users.username, username)))?.[0] || null;

    const findAll = async (): Promise<User[]> => await db.select().from(users);

    const update = async (id: number, data: Partial<User>): Promise<User | null> =>
        (await db.update(users).set(data).where(eq(users.id, id)).returning())?.[0] || null;

    const remove = async (id: number): Promise<User | null> =>
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
