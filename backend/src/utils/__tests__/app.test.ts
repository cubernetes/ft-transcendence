import { test } from "tap";
import { faker } from "@faker-js/faker";
import buildApp from "../app.ts";

const testEnv = (name: string, env: Partial<typeof process.env>, shouldResolve: boolean) => {
    test(name, async (t) => {
        const originalEnv = { ...process.env };
        t.teardown(() => {
            process.env = originalEnv;
        });

        // Set up base valid env
        process.env = {
            ...process.env,
            BACKEND_PORT: "3000",
            JWT_SECRET: faker.string.alphanumeric(32),
            DB_PATH: "drizzle/db.sqlite",
        };

        Object.assign(process.env, env);

        const result = await buildApp({ logger: false });

        shouldResolve
            ? t.ok(result.isOk(), `Expected success: ${JSON.stringify(env)}`)
            : t.ok(result.isErr(), `Expected failure: ${JSON.stringify(env)}`);
    });
};

testEnv("BACK_END is not a number", { BACKEND_PORT: "300a" }, false);
testEnv("BACK_END is negative", { BACKEND_PORT: "-3000" }, false);
testEnv("BACK_END is not an integer", { BACKEND_PORT: "342.1" }, false);

testEnv("JWT_SECRET is empty", { JWT_SECRET: "" }, false);
testEnv("JWT_SECRET is too short", { JWT_SECRET: "short" }, false);
testEnv("JWT_SECRET is valid", { JWT_SECRET: faker.string.alphanumeric(32) }, true);

testEnv("DB_PATH is empty", { DB_PATH: "" }, false);
testEnv("DB_PATH is a valid a path", { DB_PATH: "drizzle/db.sqlite" }, true);
testEnv("DB_PATH is not valid a path", { DB_PATH: "drizzl/db.sqlite" }, false);

test("Required env variables are not present", async (t) => {
    const originalEnv = { ...process.env };
    t.teardown(() => {
        process.env = originalEnv;
    });

    process.env = {
        BACKEND_PORT: "3000",
        JWT_SECRET: faker.string.alphanumeric(32),
        DB_PATH: "drizzle/db.sqlite",
    };

    delete process.env.BACKEND_PORT;
    let result = await buildApp({ logger: false });
    t.ok(result.isErr(), "expected result to be an error");
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error.message, "BACKEND_PORT is required")
    );

    process.env.BACKEND_PORT = "3000";
    delete process.env.JWT_SECRET;
    result = await buildApp({ logger: false });
    t.ok(result.isErr());
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error.message, "JWT_SECRET is required")
    );

    process.env.JWT_SECRET = faker.string.alphanumeric(32);
    delete process.env.DB_PATH;
    result = await buildApp({ logger: false });
    t.ok(result.isErr());
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error.message, "DB_PATH is required")
    );

    delete process.env.BACKEND_PORT;
    result = await buildApp({ logger: false });
    t.ok(result.isErr());
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error.message, "BACKEND_PORT is required; DB_PATH is required")
    );

    t.end();
});
