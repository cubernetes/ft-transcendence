import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { count, desc, eq } from "drizzle-orm";
import { PersonalUser, PublicUser } from "@darrenkuro/pong-core";
import { users } from "../../core/db/db.schema.ts";
import { ApiError, ServerError, errUniqueConstraintOn } from "../../utils/api-response.ts";
import { NewUser, User } from "./user.types.ts";
import { getDynamicFields, hideFieldsPersonal, hideFieldsPublic } from "./user.utils.ts";

export const createUserService = (app: FastifyInstance) => {
    const { db } = app;

    const create = async (data: NewUser): Promise<Result<User, ApiError>> => {
        try {
            const inserted = await db.insert(users).values(data).returning();
            const user = inserted[0];

            if (!user) return err(new ServerError("Database error when creating user"));

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) {
                return err(new ApiError("USERNAME_TAKEN", 409, "Username already taken"));
            }

            app.log.debug({ error }, "Failed to create user");
            return err(new ServerError("Failed to create user"));
        }
    };

    const findById = async (id: number): Promise<Result<User, ApiError>> => {
        try {
            const result = await db.select().from(users).where(eq(users.id, id));
            const user = result[0];

            if (!user) return err(new ApiError("NOT_FOUND", 404, "User not found"));

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to find user by id");
            return err(new ServerError("Failed to find user by id"));
        }
    };

    const findByUsername = async (username: string): Promise<Result<User, ApiError>> => {
        try {
            const result = await db.select().from(users).where(eq(users.username, username));
            const user = result[0];

            if (!user) return err(new ApiError("NOT_FOUND", 404, "User not found"));

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to find user by username");
            return err(new ServerError("Failed to find user by username"));
        }
    };

    const getUsernameById = async (id: number): Promise<Result<string, ApiError>> => {
        try {
            const result = await db.select().from(users).where(eq(users.id, id));
            const user = result[0];

            if (!user) return err(new ApiError("NOT_FOUND", 404, "User not found"));

            return ok(user.username);
        } catch (error) {
            app.log.debug({ error }, "Failed to find user by id");
            return err(new ServerError("Failed to find user by id"));
        }
    };

    const findAll = async (): Promise<Result<User[], ApiError>> => {
        try {
            const result = await db.select().from(users);
            return ok(result);
        } catch (error) {
            app.log.debug({ error }, "Failed to find all users");
            return err(new ServerError("Failed to find all users"));
        }
    };

    const update = async (id: number, data: Partial<User>): Promise<Result<User, ApiError>> => {
        try {
            const updated = await db.update(users).set(data).where(eq(users.id, id)).returning();
            const user = updated[0];

            if (!user) return err(new ApiError("NOT_FOUND", 404, "User not found"));

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) {
                return err(new ApiError("USERNAME_TAKEN", 409, "Username already taken"));
            }

            app.log.debug({ error }, "Failed to update user");
            return err(new ServerError("Failed to update user"));
        }
    };

    const remove = async (id: number): Promise<Result<User, ApiError>> => {
        try {
            const deleted = await db.delete(users).where(eq(users.id, id)).returning();
            const user = deleted[0];

            if (!user) return err(new ApiError("NOT_FOUND", 404, "User not found"));

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to remove user");
            return err(new ServerError("Failed to remove user"));
        }
    };

    const getCount = async (): Promise<Result<number, ApiError>> => {
        try {
            const [result] = await db.select({ count: count() }).from(users);

            if (!result) return err(new ServerError("Failed to get user count"));
            if (typeof result.count !== "number")
                return err(new ServerError("User count isn't of type number"));

            return ok(result.count);
        } catch (error) {
            app.log.debug({ error }, "Failed to get user count");
            return err(new ServerError("Failed to get user count"));
        }
    };

    const getRankByUsername = async (username: string): Promise<Result<number, ApiError>> => {
        const orderedByWins = await db
            .select({ username: users.username, wins: users.wins })
            .from(users)
            .orderBy(desc(users.wins)); // TODO: consider other metrics to break the tie etc.

        const rank = orderedByWins.findIndex((u) => u.username === username) + 1; // Zero indexed
        return ok(rank);
    };

    const toPublicUser = async (user: User): Promise<Result<PublicUser, ApiError>> => {
        const tryGetDynamicFields = await getDynamicFields(user, app);
        if (tryGetDynamicFields.isErr()) return err(tryGetDynamicFields.error);

        return ok({ ...hideFieldsPublic(user), ...tryGetDynamicFields.value });
    };

    const toPersonalUser = async (user: User): Promise<Result<PersonalUser, ApiError>> => {
        const tryGetDynamicFields = await getDynamicFields(user, app);
        if (tryGetDynamicFields.isErr()) return err(tryGetDynamicFields.error);

        return ok({ ...hideFieldsPersonal(user), ...tryGetDynamicFields.value });
    };

    return {
        create,
        findById,
        findByUsername,
        getUsernameById,
        findAll,
        update,
        remove,
        getCount,
        getRankByUsername,
        toPublicUser,
        toPersonalUser,
    };
};
