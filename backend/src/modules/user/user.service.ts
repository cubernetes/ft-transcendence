import type { FastifyInstance } from "fastify";
import { users } from "../../core/db/db.schema.ts";
import { NewUser, PublicUser, User } from "./user.types.ts";
import { eq, count } from "drizzle-orm";
import { ApiError, errUniqueConstraintOn } from "../../utils/errors.ts";
import { ok, error, Result } from "../../utils/errors.ts";
import { toPublicUser } from "./user.helpers.ts";

export const createUserService = (fastify: FastifyInstance) => {
    const db = fastify.db;

    const create = async (data: NewUser): Promise<Result<User, ApiError>> => {
        try {
            const user = (await db.insert(users).values(data).returning())?.[0];
            return ok(user);
        } catch (err) {
            if (errUniqueConstraintOn(err, "users.username")) {
                return error(new ApiError("USERNAME_TAKEN", 409, "Username already taken"));
            }

            return error(err);
        }
    };

    const findById = async (id: number): Promise<Result<User, ApiError>> => {
        try {
            const user = (await db.select().from(users).where(eq(users.id, id)))?.[0];
            return ok(user);
        } catch (err) {
            return error(new ApiError("NOT_FOUND", 404, "User not found"));
        }
    };

    const findByUsername = async (username: string): Promise<Result<User, ApiError>> => {
        try {
            // TODO: TEST this
            const user = (await db.select().from(users).where(eq(users.username, username)))?.[0];
            return ok(user);
        } catch (err) {
            return error(new ApiError("NOT_FOUND", 404, "User not found"));
        }
    };

    const findAll = async (): Promise<Result<PublicUser[], ApiError>> => {
        try {
            const result = await db.select().from(users);
            const publicUsers = result.map(toPublicUser);
            return ok(publicUsers);
        } catch (err) {
            return error(err);
        }
    };

    const update = async (id: number, data: Partial<User>): Promise<User | null> =>
        (await db.update(users).set(data).where(eq(users.id, id)).returning())?.[0] || null;

    const remove = async (id: number): Promise<User | null> =>
        (await db.delete(users).where(eq(users.id, id)).returning())?.[0] || null;

    const getCount = async (): Promise<number> => {
        const [result] = await db.select({ count: count() }).from(users);
        return result.count;
    };

    return {
        create,
        findById,
        findByUsername,
        findAll,
        update,
        remove,
        getCount,
    };
};
