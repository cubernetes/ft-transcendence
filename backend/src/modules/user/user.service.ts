import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { count, eq } from "drizzle-orm";
import { users } from "../../core/db/db.schema.ts";
import { ApiError, UnknownError, errUniqueConstraintOn } from "../../utils/errors.ts";
import { NewUser, User } from "./user.types.ts";

export const createUserService = (app: FastifyInstance) => {
    const db = app.db;

    const create = async (data: NewUser): Promise<Result<User, ApiError>> => {
        try {
            const inserted = await db.insert(users).values(data).returning();
            const user = inserted[0];

            if (!user) {
                return err(new UnknownError("Failed to create user"));
            }

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) {
                return err(new ApiError("USERNAME_TAKEN", 409, "Username already taken"));
            }

            app.log.debug({ error }, "Failed to create user");
            return err(new UnknownError("Failed to create user"));
        }
    };

    const findById = async (id: number): Promise<Result<User, ApiError>> => {
        try {
            const result = await db.select().from(users).where(eq(users.id, id));
            const user = result[0];

            if (!user) {
                return err(new ApiError("NOT_FOUND", 404, "User not found"));
            }

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to find user by id");
            return err(new UnknownError("Failed to find user by id"));
        }
    };

    const findByUsername = async (username: string): Promise<Result<User, ApiError>> => {
        try {
            const result = await db.select().from(users).where(eq(users.username, username));
            const user = result[0];

            if (!user) {
                return err(new ApiError("NOT_FOUND", 404, "User not found"));
            }

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to find user by username");
            return err(new UnknownError("Failed to find user by username"));
        }
    };

    const findAll = async (): Promise<Result<User[], ApiError>> => {
        try {
            const result = await db.select().from(users);
            return ok(result);
        } catch (error) {
            app.log.debug({ error }, "Failed to find all users");
            return err(new UnknownError("Failed to find all users"));
        }
    };

    const update = async (id: number, data: Partial<User>): Promise<Result<User, ApiError>> => {
        try {
            const updated = await db.update(users).set(data).where(eq(users.id, id)).returning();
            const user = updated[0];

            if (!user) {
                return err(new ApiError("NOT_FOUND", 404, "User not found"));
            }

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) {
                return err(new ApiError("USERNAME_TAKEN", 409, "Username already taken"));
            }

            app.log.debug({ error }, "Failed to update user");
            return err(new UnknownError("Failed to update user"));
        }
    };

    const remove = async (id: number): Promise<Result<User, ApiError>> => {
        try {
            const deleted = await db.delete(users).where(eq(users.id, id)).returning();
            const user = deleted[0];

            if (!user) {
                return err(new ApiError("NOT_FOUND", 404, "User not found"));
            }

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to remove user");
            return err(new UnknownError("Failed to remove user"));
        }
    };

    const getCount = async (): Promise<Result<number, ApiError>> => {
        try {
            const [result] = await db.select({ count: count() }).from(users);

            if (!result || typeof result.count !== "number") {
                return err(new UnknownError("Failed to get user count"));
            }

            return ok(result.count);
        } catch (error) {
            app.log.debug({ error }, "Failed to get user count");
            return err(new UnknownError("Failed to get user count"));
        }
    };

    const getRankById = async (id: number): Promise<Result<number, ApiError>> => {
        // TODO:
        return ok(id);
    };

    return {
        create,
        findById,
        findByUsername,
        findAll,
        update,
        remove,
        getCount,
        getRankById,
    };
};
