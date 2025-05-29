import { test } from "tap";
import { faker } from "@faker-js/faker";
import { buildApp } from "../app.ts";

const testEnv = (name: string, env: Partial<typeof process.env>, shouldResolve: boolean) => {
    test(name, async (t) => {
        const originalEnv = { ...process.env };
        t.teardown(() => {
            process.env = originalEnv;
        });

        Object.assign(process.env, env);

        const result = await buildApp({ logger: false });

        shouldResolve
            ? t.ok(result.isOk(), `Expected success: ${JSON.stringify(env)}`)
            : t.ok(result.isErr(), `Expected failure: ${JSON.stringify(env)}`);
    });
};

testEnv("DB_PATH is not valid a path", { DB_PATH: "drizzl/db.sqlite" }, false);
testEnv("DB_PATH is :memory:, DB_DIR is drizzle", { DB_PATH: ":memory:", DB_DIR: "drizzle" }, true);

test("Required env variables are not present", async (t) => {
    const originalEnv = { ...process.env };
    t.teardown(() => {
        process.env = originalEnv;
    });

    delete process.env.BACKEND_PORT;
    let result = await buildApp({ logger: false });
    t.ok(result.isErr(), "expected result to be an error");
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error, "BACKEND_PORT is required")
    );
    process.env.BACKEND_PORT = "3000";

    delete process.env.JWT_SECRET;
    result = await buildApp({ logger: false });
    t.ok(result.isErr());
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error, "JWT_SECRET is required")
    );
    process.env.JWT_SECRET = faker.string.alphanumeric(32);

    delete process.env.DB_PATH;
    result = await buildApp({ logger: false });
    t.ok(result.isErr());
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error, "DB_PATH is required")
    );

    delete process.env.BACKEND_PORT;
    result = await buildApp({ logger: false });
    t.ok(result.isErr());
    result.match(
        () => t.fail("expected error"),
        (error) => t.match(error, "BACKEND_PORT is required; DB_PATH is required")
    );
    process.env.BACKEND_PORT = "3000";
    process.env.DB_PATH = ":memory:";
});
