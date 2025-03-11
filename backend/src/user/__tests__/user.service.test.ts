import { test } from "tap";
import { createUserSchema } from "../user.type.ts";
import { faker } from "@faker-js/faker";

test("createUserSchema - valid data passes", async (t) => {
    // const app = await buildTestApp();

    const pw = faker.internet.password();
    const result = createUserSchema.safeParse({
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        password: pw,
        confirmPassword: pw,
    });

    t.ok(result.success, "Valid user data should pass");
    t.equal(result.data?.username, "darren");
    t.end();
});
