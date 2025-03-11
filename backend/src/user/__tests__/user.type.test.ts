import { test } from "tap";
import { createUserSchema } from "../user.type.ts";

test("createUserSchema - valid data passes", (t) => {
    const result = createUserSchema.safeParse({
        username: "darren",
        displayName: "Darren Dev",
        password: "dummy_password",
        confirmPassword: "dummy_password",
    });

    t.ok(result.success, "Valid user data should pass");
    t.equal(result.data?.username, "darren");
    t.end();
});
