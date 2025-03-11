//import { users } from "./schema";
import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";

const seedUsers = (n: number, fastify: FastifyInstance) => {
    const fakeUsers = Array.from({ length: n }, () => ({
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        passwordHash: faker.internet.password(),
    }));

    fastify.log.info(`Seeding fakerUser ${fakeUsers[0]}`);
    fakeUsers.forEach((user) => {
        fastify.userService.create(user);
    });
};

export const seed = async (fastify: FastifyInstance) => {
    fastify.log.info(`Seed database with initial data...`);
    await seedUsers(5, fastify);
};
