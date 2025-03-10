import t from "tap";
import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { createAuthService } from "../../../src/modules/auth/auth.service.ts";

t.test("authService - hashPassword + comparePassword", async (t) => {
    const app = Fastify();
    await app.ready();
    const authService = createAuthService(app);

    const password = "test-password";
    const hash = await authService.hashPassword(password);
    t.ok(hash, "Hash should be returned");
    t.not(hash, password, "Hash should not match raw password");

    const isMatch = await authService.comparePassword(password, hash);
    t.ok(isMatch, "Password should match the hash");

    const isWrong = await authService.comparePassword("wrong-password", hash);
    t.notOk(isWrong, "Wrong password should not match the hash");

    t.end();
});

t.test("authService - jwt sign + verify", async (t) => {
    const app = Fastify();
    await app.register(fastifyJwt, { secret: "super-secret-for-tests" });
    await app.ready();
    const authService = createAuthService(app);

    const id = 1;
    const username = "darren";

    const token = authService.generateToken(id, username);
    t.type(token, "string", "should return a string JWT");

    const decoded = authService.verifyToken(token);

    t.match(decoded, { id, username }, "decoded token contains id and username");
    t.end();
});
