import type { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker";

const seedUsers = async (n: number, app: FastifyInstance) => {
    const fakeUsers = Array.from({ length: n }, () => ({
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        passwordHash: faker.internet.password(),
    }));

    app.log.info(`seeding ${n} faker users...`);

    const seedOneUser = async (newUser: (typeof fakeUsers)[number]) => {
        const user = await app.userService.create(newUser);

        if (user.isErr()) {
            return app.log.error({ err: user.error }, "failed to create user");
        }

        const stats = {
            wins: faker.number.int({ min: 0, max: 100 }),
            losses: faker.number.int({ min: 0, max: 100 }),
        };

        await app.userService.update(user.value.id, stats);
    };

    await Promise.all(fakeUsers.map(seedOneUser));
};

export const mockGame = (id: number, total: number) => {
    const player1Hits = faker.number.int({ min: 0, max: 100 });
    const player2Hits = faker.number.int({ min: 0, max: 100 });
    const winner = faker.number.int({ min: 0, max: 1 });
    const player1Score = winner === 0 ? 11 : faker.number.int({ min: 0, max: 10 });
    const player2Score = winner === 1 ? 11 : faker.number.int({ min: 0, max: 10 });
    const index = faker.number.int({ min: 0, max: 1 });
    let opponent = faker.number.int({ min: 1, max: total });
    if (opponent === 1) opponent = opponent - 1;
    const player1Id = index === 0 ? id : opponent;
    const player2Id = index === 1 ? id : opponent;
    const winnerId = winner === 0 ? player1Id : player2Id;

    return {
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        player1Id,
        player2Id,
        winnerId,
        player1Hits,
        player2Hits,
        player1Score,
        player2Score,
    };
};

export const seed = async (app: FastifyInstance) => {
    const userCount = await app.userService.getCount();

    if (userCount.isErr()) {
        return app.log.error({ err: userCount.error }, "failed to get user count");
    }

    // Only seed users if there aren't a significant amount
    if (userCount.value <= 200) {
        await seedUsers(20, app);
    }
};
