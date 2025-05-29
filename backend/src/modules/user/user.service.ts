import type { UserInsert, UserRecord } from "../../core/db/db.types.ts";
import type { FastifyInstance } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { Result, err, ok } from "neverthrow";
import { asc, count, desc, eq } from "drizzle-orm";
import { writeFile } from "fs/promises";
import { extname, join } from "path";
import { ErrorCode, PersonalUser, PublicUser } from "@darrenkuro/pong-core";
import { users } from "../../core/db/db.schema.ts";
import { errUniqueConstraintOn } from "../../core/db/db.utils.ts";
import { getDynamicFields, hideFieldsPersonal, hideFieldsPublic } from "./user.utils.ts";

export const createUserService = (app: FastifyInstance) => {
    const { db } = app;

    const create = async (data: UserInsert): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const inserted = await db.insert(users).values(data).returning();
            const user = inserted[0];

            if (!user) throw new Error("user returned is empty");

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) return err("USERNAME_TAKEN");

            app.log.debug({ error }, "failed to create user");
            return err("SERVER_ERROR");
        }
    };

    const findById = async (id: number): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const result = await db.select().from(users).where(eq(users.id, id));
            const user = result[0];

            if (!user) return err("USER_NOT_FOUND");

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "failed to find user by id");
            return err("SERVER_ERROR");
        }
    };

    const findByUsername = async (username: string): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const result = await db.select().from(users).where(eq(users.username, username));
            const user = result[0];

            if (!user) return err("USER_NOT_FOUND");

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "failed to find user by username");
            return err("SERVER_ERROR");
        }
    };

    const getUsernameById = async (id: number): Promise<Result<string, ErrorCode>> => {
        try {
            const result = await db.select().from(users).where(eq(users.id, id));
            const user = result[0];

            if (!user) return err("USER_NOT_FOUND");

            return ok(user.username);
        } catch (error) {
            app.log.debug({ error }, "failed to get username by id");
            return err("SERVER_ERROR");
        }
    };

    const findAll = async (): Promise<Result<UserRecord[], ErrorCode>> => {
        try {
            const result = await db.select().from(users);
            return ok(result);
        } catch (error) {
            app.log.debug({ error }, "failed to find all users");
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

            if (!user) return err("USER_NOT_FOUND");

            return ok(user);
        } catch (error) {
            if (errUniqueConstraintOn(error, "users.username")) return err("USERNAME_TAKEN");

            app.log.debug({ error }, "failed to update user");
            return err("SERVER_ERROR");
        }
    };

    const remove = async (id: number): Promise<Result<UserRecord, ErrorCode>> => {
        try {
            const deleted = await db.delete(users).where(eq(users.id, id)).returning();
            const user = deleted[0];

            if (!user) return err("USER_NOT_FOUND");

            return ok(user);
        } catch (error) {
            app.log.debug({ error }, "failed to remove user");
            return err("SERVER_ERROR");
        }
    };

    const upload = async (
        file: MultipartFile,
        username: string
    ): Promise<Result<string, ErrorCode>> => {
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (!ALLOWED_TYPES.includes(file.mimetype)) return err("VALIDATION_ERROR");

        const ext = extname(file.filename);
        const filename = `${username}${ext}`; // Every user will have one, will overwrite
        const filepath = join(app.config.uploadDir, filename);

        const buffer = await file.toBuffer();
        if (buffer.length > MAX_SIZE) return err("PAYLOAD_TOO_LARGE");

        await writeFile(filepath, buffer);
        return ok(filepath);
    };

    const getCount = async (): Promise<Result<number, ErrorCode>> => {
        try {
            const [result] = await db.select({ count: count() }).from(users);
            if (!result) throw new Error("no result");
            if (typeof result.count !== "number") throw new Error("result type is not number");

            return ok(result.count);
        } catch (error) {
            app.log.debug({ error }, "failed to get user count");
            return err("SERVER_ERROR");
        }
    };

    const getRankByUsername = async (username: string): Promise<Result<number, ErrorCode>> => {
        const orderedByWins = await db
            .select({ username: users.username, wins: users.wins })
            .from(users)
            .orderBy(
                desc(users.wins),
                asc(users.losses),
                asc(users.createdAt),
                asc(users.username)
            );

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
        upload,
        getCount,
        getRankByUsername,
        toPublicUser,
        toPersonalUser,
    };
};
