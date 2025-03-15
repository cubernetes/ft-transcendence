import { test } from "tap";
import { buildApp } from "../app.ts";
import { faker } from "@faker-js/faker";

const testEnv = (name: string, env: Partial<typeof process.env>, shouldResolve: boolean) => {
    test(name, async (t) => {
        const originalEnv = { ...process.env };
        t.teardown(() => {
            process.env = originalEnv;
        });

        /** Assign a set of valid env variables */
        process.env = {
            ...process.env,
            BACKEND_PORT: "3000",
            JWT_SECRET: faker.string.alphanumeric(32),
            DB_PATH: "drizzle/db.sqlite",
        };

        Object.assign(process.env, env);
        const app = buildApp({ logger: false }, true);
        shouldResolve
            ? await t.resolves(app, `${JSON.stringify(env)}`)
            : await t.rejects(app, `${JSON.stringify(env)}`);
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

    /** Assign a set of valid env variables */
    process.env = {
        ...process.env,
        BACKEND_PORT: "3000",
        JWT_SECRET: faker.string.alphanumeric(32),
        DB_PATH: "drizzle/db.sqlite",
    };
    const app = buildApp({ logger: false }, true);

    delete process.env.BACKEND_PORT;
    await t.rejects(app, "BACKEND_PORT needs to be present");

    process.env.BACKEND_PORT = "3000";
    delete process.env.JWT_SECRET;
    await t.rejects(app, "JWT_SECRET needs to be present");

    process.env.JWT_SECRET = faker.string.alphanumeric(32);
    delete process.env.DB_PATH;
    await t.rejects(app, "DB_PATH needs to be present");
});
