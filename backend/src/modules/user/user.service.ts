import type { UserInsert, UserRecord } from "../../core/db/db.types.ts";
import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { count, desc, eq } from "drizzle-orm";
import { ErrorCode, PersonalUser, PublicUser } from "@darrenkuro/pong-core";
import { users } from "../../core/db/db.schema.ts";
import { errUniqueConstraintOn } from "../../utils/api-response.ts";
import { getDynamicFields, hideFieldsPersonal, hideFieldsPublic } from "./user.utils.ts";

export const createUserService = (app: FastifyInstance) => {
    const { db } = app;

    const create = async (data: UserInsert): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const inserted = await db.insert(users).values(data).returning();
            const user = inserted[0];

            if (!user) throw new Error("User returned is empty");

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) return err("USERNAME_TAKEN");

            app.log.debug({ error }, "Failed to create user");
            return err("SERVER_ERROR");
        }
    };

    const findById = async (id: number): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const result = await db.select().from(users).where(eq(users.id, id));
            const user = result[0];

            if (!user) return err("NOT_FOUND");

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to find user by id");
            return err("SERVER_ERROR");
        }
    };

    const findByUsername = async (username: string): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const result = await db.select().from(users).where(eq(users.username, username));
            const user = result[0];

            if (!user) return err("NOT_FOUND");

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to find user by username");
            return err("SERVER_ERROR");
        }
    };

    const getUsernameById = async (id: number): Promise<Result<string, ErrorCode>> => {
        try {
            const result = await db.select().from(users).where(eq(users.id, id));
            const user = result[0];

            if (!user) return err("NOT_FOUND");

            return ok(user.username);
        } catch (error) {
            app.log.debug({ error }, "Failed to get username by id");
            return err("SERVER_ERROR");
        }
    };

    const findAll = async (): Promise<Result<UserRecord[], ErrorCode>> => {
        try {
            const result = await db.select().from(users);
            return ok(result);
        } catch (error) {
            app.log.debug({ error }, "Failed to find all users");
            return err("SERVER_ERROR");
        }
    };

    const update = async (
        id: number,
        data: Partial<UserRecord>
    ): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const updated = await db.update(users).set(data).where(eq(users.id, id)).returning();
            const user = updated[0];

            if (!user) return err("NOT_FOUND");

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) return err("USERNAME_TAKEN");

            app.log.debug({ error }, "Failed to update user");
            return err("SERVER_ERROR");
        }
    };

    const remove = async (id: number): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const deleted = await db.delete(users).where(eq(users.id, id)).returning();
            const user = deleted[0];

            if (!user) return err("NOT_FOUND");

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "Failed to remove user");
            return err("SERVER_ERROR");
        }
    };

    const getCount = async (): Promise<Result<number, ErrorCode>> => {
        try {
            const [result] = await db.select({ count: count() }).from(users);
            if (!result) throw new Error("No result");
            if (typeof result.count !== "number") throw new Error("Result type is not number");

            return ok(result.count);
        } catch (error) {
            app.log.debug({ error }, "Failed to get user count");
            return err("SERVER_ERROR");
        }
    };

    const getRankByUsername = async (username: string): Promise<Result<number, ErrorCode>> => {
        const orderedByWins = await db
            .select({ username: users.username, wins: users.wins })
            .from(users)
            .orderBy(desc(users.wins)); // TODO: consider other metrics to break the tie etc.

        const rank = orderedByWins.findIndex((u) => u.username === username) + 1; // Zero indexed
        return ok(rank);
    };

    const toPublicUser = async (user: UserRecord): Promise<Result<PublicUser, ErrorCode>> => {
        const tryGetDynamicFields = await getDynamicFields(user, app);
        if (tryGetDynamicFields.isErr()) return err(tryGetDynamicFields.error);

        return ok({ ...hideFieldsPublic(user), ...tryGetDynamicFields.value });
    };

    const toPersonalUser = async (user: UserRecord): Promise<Result<PersonalUser, ErrorCode>> => {
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
