import { test } from "tap";
import { faker } from "@faker-js/faker";
import { buildApp } from "../../../utils/app.ts";

test("Create user", async (t) => {
    const tryBuild = await buildApp({ logger: false });
    if (tryBuild.isErr()) {
        return t.fail("Failed to build app");
    }

    const app = tryBuild.value;

    t.teardown(() => app.close());

    const username = faker.internet.username();
    const displayName = faker.person.firstName();
    const passwordHash = faker.internet.password();
    let user = await app.userService.create({
        username,
        displayName,
        passwordHash,
    });

    if (user.isErr()) {
        return t.fail("User should be created");
    }

    t.ok(user.value, "User should be returned");
    t.equal(user.value.username, username, "Username should match");
    t.equal(user.value.displayName, displayName, "Display name should match");
    t.equal(user.value.passwordHash, passwordHash, "Password hash should be undefined");

    user = await app.userService.create({
        username,
        displayName,
        passwordHash,
    });

    if (user.isOk()) return t.fail("User should not be created");

    t.equal(user.error, "USERNAME_TAKEN", "Error code should be USERNAME_TAKEN");

    user = await app.userService.findById(-1);
    t.ok(user.isErr(), "User should not be found");

    user = await app.userService.update(-1, { displayName: faker.person.firstName() });
    t.ok(user.isErr(), "User should not be updated");
});
