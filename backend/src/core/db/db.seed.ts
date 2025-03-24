//import { users } from "./schema";
import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";

const seedUsers = async (n: number, fastify: FastifyInstance) => {
    const fakeUsers = Array.from({ length: n }, () => ({
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        passwordHash: faker.internet.password(),
    }));

    fastify.log.info(`Seeding ${n} faker users...`);

    const seedOneUser = async (newUser: (typeof fakeUsers)[number]) => {
        try {
            const user = await fastify.userService.create(newUser);

            const stats = {
                wins: faker.number.int({ min: 0, max: 100 }),
                losses: faker.number.int({ min: 0, max: 100 }),
            };

            await fastify.userService.update(user.id, stats);
        } catch (err) {
            fastify.log.error({ err }, "Failed to create or update user");
        }
    };

    await Promise.all(fakeUsers.map(seedOneUser));
};

export const seed = async (fastify: FastifyInstance) => {
    fastify.log.info(`Seed database with initial data...`);
    await seedUsers(20, fastify);
};
