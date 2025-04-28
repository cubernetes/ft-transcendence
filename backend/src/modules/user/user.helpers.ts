import { faker } from "@faker-js/faker";
import { User } from "./user.types.ts";

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
