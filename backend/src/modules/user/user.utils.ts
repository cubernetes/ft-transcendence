import type { UserRecord } from "../../core/db/db.types.ts";
import { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { faker } from "@faker-js/faker";
import { ErrorCode, PublicGame } from "@darrenkuro/pong-core";

// Configure object fields to be hidden for personal response
const hiddenFieldsPersonal = ["passwordHash", "totpSecret", "temporaryTotpSecret"] as const;
type HiddenFieldsPersonal = (typeof hiddenFieldsPersonal)[number];

/** Remove sensitive fields from user before sending response to users. */
export const hideFieldsPersonal = (user: UserRecord): Omit<UserRecord, HiddenFieldsPersonal> => {
    const safeUser = { ...user };
    for (const field of hiddenFieldsPersonal) {
        delete safeUser[field];
    }

    return safeUser;
};

// Configure object fields to be hidden for public response
const hiddenFieldsPublic = [...hiddenFieldsPersonal, "totpEnabled"] as const;
type HiddenFieldsPublic = (typeof hiddenFieldsPublic)[number];

/** Remove sensitive fields from user before sending response to public. */
export const hideFieldsPublic = (user: UserRecord): Omit<UserRecord, HiddenFieldsPublic> => {
    const safeUser = { ...user };
    for (const field of hiddenFieldsPublic) {
        delete safeUser[field];
    }

    return safeUser;
};

// Configure additional fields to be appended dynamically
type DynamicFields = { rank: number; games: PublicGame[]; totalGames: number };

/** Append dynamic user data. */
export const getDynamicFields = async (
    user: UserRecord,
    app: FastifyInstance
): Promise<Result<DynamicFields, ErrorCode>> => {
    // Get game history
    const tryGetGames = await app.gameService.getGamesByUsername(user.username);
    if (tryGetGames.isErr()) return err(tryGetGames.error);
    const games = tryGetGames.value;

    // Attach calculated fields rank and total games
    const tryGetRank = await app.userService.getRankByUsername(user.username);
    if (tryGetRank.isErr()) return err(tryGetRank.error);
    const rank = tryGetRank.value;

    // Calculate total games by counting items in game array
    const totalGames = games.length;

    return ok({ rank, games, totalGames });
};

export const mockUser = (): UserRecord => {
    return {
        id: faker.number.int(),
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        passwordHash: faker.string.alphanumeric(60),
        totpSecret: faker.string.uuid(),
        temporaryTotpSecret: "",
        totpEnabled: faker.number.int({ min: 0, max: 1 }),
        avatarUrl: faker.image.avatar(),
        wins: faker.number.int({ min: 0, max: 1000 }),
        losses: faker.number.int({ min: 0, max: 1000 }),
        createdAt: faker.date.past().toISOString(),
    };
};
