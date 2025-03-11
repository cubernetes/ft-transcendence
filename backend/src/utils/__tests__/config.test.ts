import { test } from "tap";
import { buildApp } from "../app.ts";

const testEnv = (name: string, env: Partial<typeof process.env>, shouldResolve: boolean) => {
    test(name, async (t) => {
        const originalEnv = { ...process.env };
        Object.assign(process.env, env);

        t.teardown(() => {
            process.env = originalEnv;
        });

        const action = buildApp({ logger: false }, true);
        shouldResolve
            ? await t.resolves(action, `${JSON.stringify(env)}`)
            : await t.rejects(action, `${JSON.stringify(env)}`);
    });
};

testEnv("BACK_END is not a number", { BACKEND_PORT: "300a" }, false);
testEnv("BACK_END is negative", { BACKEND_PORT: "-3000" }, false);
testEnv("BACK_END is not an integer", { BACKEND_PORT: "342.1" }, false);

testEnv("JWT_SECRET is empty", { JWT_SECRET: "" }, false);

testEnv("DB_PATH is empty", { DB_PATH: "" }, false);
testEnv("DB_PATH is a valid a path", { DB_PATH: "drizzle/db.sqlite" }, true);
testEnv("DB_PATH is not valid a path", { DB_PATH: "drizzl/db.sqlite" }, false);
