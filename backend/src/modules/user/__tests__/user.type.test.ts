import { test } from "tap";
import { createUserSchema } from "../user.types.ts";
import { faker } from "@faker-js/faker";

test("createUserSchema - valid data passes", (t) => {
    const username = faker.internet.username();
    const displayName = faker.person.firstName();
    const pw = faker.internet.password();
    const result = createUserSchema.safeParse({
        username,
        displayName,
        password: pw,
        confirmPassword: pw,
    });

    t.ok(result.success, "Valid user data should pass");
    t.equal(result.data?.username, username);
    t.equal(result.data?.displayName, displayName);
    t.end();
});
