import { test } from "tap";
import { faker } from "@faker-js/faker";
import { configSchema } from "../config.schema.ts";

const testConfig = (name: string, cfg: Record<string, string>, shouldPass: boolean) => {
    test(name, async (t) => {
        const config = {
            BACKEND_PORT: "3000",
            JWT_SECRET: faker.string.alphanumeric(32),
            DB_PATH: "drizzle/db.sqlite",
        };

        Object.assign(config, cfg);

        const result = configSchema.safeParse(config);

        shouldPass
            ? t.ok(result.success, `Expected success: ${JSON.stringify(cfg)}`)
            : t.notOk(result.success, `Expected failure: ${JSON.stringify(cfg)}`);
    });
};

testConfig("BACKEND_PORT is not a number", { BACKEND_PORT: "not-a-number" }, false);
testConfig("BACKEND_PORT is negative", { BACKEND_PORT: "-3000" }, false);
testConfig("BACKEND_PORT is not an integer", { BACKEND_PORT: "342.1" }, false);

testConfig("JWT_SECRET is empty", { JWT_SECRET: "" }, false);
testConfig("JWT_SECRET is too short", { JWT_SECRET: "short" }, false);
testConfig("JWT_SECRET is valid", { JWT_SECRET: faker.string.alphanumeric(32) }, true);

testConfig("DB_PATH is empty", { DB_PATH: "" }, false);
testConfig("DB_PATH is a valid a path", { DB_PATH: "drizzle/db.sqlite" }, true);

testConfig("API_PREFIX doesn't start with a slash", { API_PREFIX: "not-a-valid-prefix" }, false);
testConfig("API_PREFIX is valid", { API_PREFIX: "/api" }, true);
testConfig("API_PREFIX has a trailing slash", { API_PREFIX: "/api/" }, false);
testConfig("API_PREFIX contains invalid characters", { API_PREFIX: "/api?q=1" }, false);

testConfig("HOST is not valid", { HOST: "not-a-valid-host" }, false);
testConfig("HOST is valid", { HOST: "127.0.0.1" }, true);
testConfig("HOST is valid", { HOST: "0.0.0.0" }, true);

testConfig("DOMAINS contains a single valid domain", { DOMAINS: "localhost" }, true);
testConfig("DOMAINS contains a single valid domain", { DOMAINS: "ft-transcendence.app" }, true);
testConfig("DOMAINS contains multiple valid domains", { DOMAINS: "localhost ft-t.app" }, true);
testConfig("DOMAINS contains multiple valid domains", { DOMAINS: "huh.dev more.abc.com" }, true);
testConfig("DOMAINS contains consecutive dots", { DOMAINS: "fail..abc.com" }, false);
testConfig("DOMAINS do not allow ip addresses", { DOMAINS: "127.0.0.1" }, false);
testConfig("DOMAINS contains a trailing dash", { DOMAINS: "example.com-" }, false);
testConfig("DOMAINS contains a trailing dash", { DOMAINS: "example-.com" }, false);
testConfig("DOMAINS contains a leading dash", { DOMAINS: "-example.com" }, false);

// Test invalidation
// Test deletion
// Test Error messages
