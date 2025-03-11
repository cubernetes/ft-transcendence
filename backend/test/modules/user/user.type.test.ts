import { test } from "tap";
import { createUserSchema } from "../../../src/modules/user/user.type.ts";

test("createUserSchema - valid data passes", (t) => {
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
