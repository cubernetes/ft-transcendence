import type { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker";

const seedUsers = async (n: number, app: FastifyInstance) => {
    const fakeUsers = Array.from({ length: n }, () => ({
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        passwordHash: faker.internet.password(),
    }));

    app.log.info(`Seeding ${n} faker users...`);

    const seedOneUser = async (newUser: (typeof fakeUsers)[number]) => {
        const user = await app.userService.create(newUser);

        if (user.isErr()) {
            return app.log.error({ err: user.error }, "Failed to create user");
        }

        const stats = {
            wins: faker.number.int({ min: 0, max: 100 }),
            losses: faker.number.int({ min: 0, max: 100 }),
        };

        await app.userService.update(user.value.id, stats);
    };

    await Promise.all(fakeUsers.map(seedOneUser));
};

export const seed = async (app: FastifyInstance) => {
    const userCount = await app.userService.getCount();

    // Only seed users if there aren't a significant amount
    if (userCount <= 200) {
        await seedUsers(20, app);
    }
};
