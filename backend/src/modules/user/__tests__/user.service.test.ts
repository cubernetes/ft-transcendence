import { test } from "tap";
import { faker } from "@faker-js/faker";
import buildApp from "../../../utils/app.ts";

test("Create user", async (t) => {
    const originalEnv = process.env;
    process.env.DB_PATH = ":memory:";
    process.env.DB_DIR = "drizzle";

    const tryBuild = await buildApp({ logger: true });
    if (tryBuild.isErr()) {
        return t.fail("Failed to build app");
    }

    const app = tryBuild.value;

    t.teardown(() => {
        process.env = originalEnv;
        app.close();
    });

    const username = faker.internet.username();
    const displayName = faker.person.firstName();
    const passwordHash = faker.internet.password();
    const user1 = await app.userService.create({
        username,
        displayName,
        passwordHash,
    });

    if (user1.isErr()) {
        return t.fail("User should be created");
    }

    t.ok(user1.value, "User should be returned");
    t.equal(user1.value.username, username, "Username should match");
    t.equal(user1.value.displayName, displayName, "Display name should match");
    t.equal(user1.value.passwordHash, passwordHash, "Password hash should be undefined");

    const dupUser = await app.userService.create({
        username,
        displayName,
        passwordHash,
    });

    if (dupUser.isOk()) {
        return t.fail("User should not be created");
    }

    t.equal(dupUser.error.code, "USERNAME_TAKEN", "Error code should be USERNAME_TAKEN");
});
