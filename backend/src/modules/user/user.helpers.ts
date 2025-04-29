import type { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker";
import { PublicUser } from "@darrenkuro/pong-core";
import { User } from "./user.types.ts";

/** Remove sensitive fields from user before sending response to themselves. */
export const toPersonalUser = (user: User): Omit<User, "passwordHash" | "totpSecret"> => {
    const { passwordHash, totpSecret, ...personalUser } = user;
    return personalUser; // TODO: Maybe add type "PersonalUser"
};

/** Remove sensitive fields from user before sending response to public. */
export const toPublicUser =
    (app: FastifyInstance) =>
    async (user: User): Promise<PublicUser> => {
        const { passwordHash, totpSecret, ...originalUser } = user;
        const rank = await app.userService.getRankById(user.id);
        // TODO: Fix
        if (rank.isErr()) {
            return { ...originalUser, rank: -1 };
        }
        const publicUser = { ...originalUser, rank: rank.value };
        return publicUser as PublicUser; // TODO: Fix Type
    };

export const mockUser = (): User => {
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
