import { test } from "tap";
import { buildApp } from "../../../utils/app.ts";

test("GET /docs and /docs/ returns swagger docs", async (t) => {
    const tryBuild = await buildApp({ logger: false });
    if (tryBuild.isErr()) {
        return t.fail("Failed to build app");
    }

    const app = tryBuild.value;
    t.teardown(() => app.close());

    const resDocs = await app.inject({
        method: "GET",
        url: "/docs",
    });

    t.equal(resDocs.statusCode, 302, "/docs should return 302 Redirect");
    t.ok(resDocs.headers.location?.endsWith("/docs/"), "Redirect should point to /docs/");

    const resDocsSlash = await app.inject({
        method: "GET",
        url: "/docs/",
    });

    t.equal(resDocsSlash.statusCode, 200, "/docs/ should return 200 OK");
    t.match(resDocsSlash.body, /<title>Swagger UI<\/title>/, "Swagger UI title should be present");
});

test("GET /docs returns 404 if in production", async (t) => {
    const originalEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = "production";
    const tryBuild = await buildApp({ logger: false });
    if (tryBuild.isErr()) {
        return t.fail("Failed to build app");
    }

    t.teardown(() => {
        process.env.NODE_ENV = originalEnv;
        app.close();
    });

    const app = tryBuild.value;

    const resDocs = await app.inject({
        method: "GET",
        url: "/docs",
    });
    const resDocsSlash = await app.inject({
        method: "GET",
        url: "/docs/",
    });

    t.equal(resDocs.statusCode, 404, "/docs should return 404 Not Found");
    t.equal(resDocsSlash.statusCode, 404, "/docs/ should return 404 Not Found");
});
