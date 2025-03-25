import { faker } from "@faker-js/faker";
import { PublicUser, User } from "./user.types.ts";

/** Remove sensitive fields from user before sending response to themselves. */
export const toPersonalUser = (user: User): Omit<User, "passwordHash"> => {
    const { passwordHash, ...personalUser } = user;
    return personalUser;
};

/** Remove sensitive fields from user before sending response to public. */
export const toPublicUser = (user: User): PublicUser => {
    const { passwordHash, totpSecret, ...publicUser } = user;
    return publicUser as PublicUser; // TODI: Fix Type
};

export const mockUser = (): User => {
    return {
        id: faker.number.int(),
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        passwordHash: faker.string.alphanumeric(60),
        totpSecret: faker.string.uuid(),
        avatarUrl: faker.image.avatar(),
        wins: faker.number.int({ min: 0, max: 1000 }),
        losses: faker.number.int({ min: 0, max: 1000 }),
        createdAt: faker.date.past().toISOString(),
    };
};
