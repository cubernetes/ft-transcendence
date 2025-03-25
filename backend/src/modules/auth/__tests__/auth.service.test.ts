import { test } from "tap";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { createAuthService } from "../auth.service.ts";
import { faker } from "@faker-js/faker";
import { mockUser } from "../../user/user.helpers.ts";

test("authService - hashPassword + comparePassword", async (t) => {
    const app = Fastify({ logger: false });
    await app.ready();
    const authService = createAuthService(app);

    const password = faker.internet.password();
    const hash = await authService.hashPassword(password);
    t.ok(hash, "Hash should be returned");
    t.not(hash, password, "Hash should not match raw password");

    const isMatch = await authService.comparePassword(password, hash);
    t.ok(isMatch, "Password should match the hash");

    const isWrong = await authService.comparePassword("wrong-password", hash);
    t.notOk(isWrong, "Wrong password should not match the hash");
});

test("authService - jwt sign + verify", async (t) => {
    const app = Fastify();
    await app.register(fastifyJwt, { secret: faker.string.alphanumeric(32) });
    await app.ready();
    const authService = createAuthService(app);

    const user = mockUser();
    const token = authService.generateToken(user);
    t.type(token, "string", "should return a string JWT");

    const decoded = authService.verifyToken(token);
    const { id, username, displayName } = user;

    t.match(decoded, { id, username, displayName }, "decoded token contains id and username");
});
