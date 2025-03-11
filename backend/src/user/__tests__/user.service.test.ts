import { test } from "tap";
import { createUserService } from "../user.service.ts";
import { createUserSchema } from "../user.type.ts";

test("createUserSchema - valid data passes", async (t) => {
    // const app = await buildTestApp();

    const result = createUserSchema.safeParse({
        username: "darren",
        displayName: "Darren Dev",
        password: "hunter222",
        confirmPassword: "hunter222",
    });

    t.ok(result.success, "Valid user data should pass");
    t.equal(result.data?.username, "darren");
    t.end();
});
