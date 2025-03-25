import type { FastifyInstance } from "fastify";
import { ok, err, Result } from "neverthrow";
import { eq, count } from "drizzle-orm";
import { users } from "../../core/db/db.schema.ts";
import { NewUser, User } from "./user.types.ts";
import { ApiError, errUniqueConstraintOn, UnknownError } from "../../utils/errors.ts";

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
        } catch (e) {
            if (errUniqueConstraintOn(e, "users.username")) {
                return err(new ApiError("USERNAME_TAKEN", 409, "Username already taken"));
            }

            app.log.debug({ err: e }, "Failed to create user");
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
        } catch (e) {
            app.log.debug({ err: e }, "Failed to find user by id");
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
        } catch (e) {
            app.log.debug({ err: e }, "Failed to find user by username");
            return err(new UnknownError("Failed to find user by username"));
        }
    };

    const findAll = async (): Promise<Result<User[], ApiError>> => {
        try {
            const result = await db.select().from(users);
            return ok(result);
        } catch (e) {
            app.log.debug({ err: e }, "Failed to find all users");
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
        } catch (e) {
            if (errUniqueConstraintOn(e, "users.username")) {
                return err(new ApiError("USERNAME_TAKEN", 409, "Username already taken"));
            }

            app.log.debug({ err: e }, "Failed to update user");
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
        } catch (e) {
            app.log.debug({ err: e }, "Failed to remove user");
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
        } catch (e) {
            app.log.debug({ err: e }, "Failed to get user count");
            return err(new UnknownError("Failed to get user count"));
        }
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
