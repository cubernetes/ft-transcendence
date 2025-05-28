import fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { Result, err, ok } from "neverthrow";
import { ZodError } from "zod";
import { corePlugin } from "../core/core.plugin.ts";
import { seed } from "../core/db/db.seed.ts";
import { modulesPlugin } from "../modules/modules.plugin.ts";

export const buildApp = async (
    opts: FastifyServerOptions
): Promise<Result<FastifyInstance, string>> => {
    const app = fastify(opts);
    // Disable ajv validation for request schema validation
    app.setValidatorCompiler(() => () => true);
    // Disable fast-json-stringify for response schema validation, leave it for now
    // app.setSerializerCompiler(() => JSON.stringify);

    try {
        await app.register(corePlugin);
        await app.register(modulesPlugin);

        app.get("/healthcheck", { logLevel: "silent" }, async (_, reply) =>
            reply.send({ status: "ok" })
        );

        // Seed database if not in production
        if (process.env.NODE_ENV !== "production") {
            // Error is non-fatal
            await seed(app).catch((error) => app.log.warn({ error }, "seed failing"));
        }

        return ok(app);
    } catch (error) {
        app.log.error({ error }, "fail to build server");

        // Safely close the server, trigger all onClose hooks
        app.close();

        if (error instanceof ZodError) {
            return err(error.issues.map((i) => i.message).join("; "));
        }

        return err(error instanceof Error ? error.message : JSON.stringify(error));
    }
};
