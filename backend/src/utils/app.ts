import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { Result, err, ok } from "neverthrow";
import { ZodError } from "zod";
import corePlugin from "../core/core.plugin.ts";
import { seed } from "../core/db/db.seed.ts";
import modulesPlugin from "../modules/modules.plugin.ts";

const buildApp = async (opts: FastifyServerOptions): Promise<Result<FastifyInstance, Error>> => {
    const app = fastify(opts);
    // Disable ajv validation for request schema validation
    app.setValidatorCompiler(() => () => true);
    // Disable fast-json-stringify for response schema validation, leave it for now
    app.setSerializerCompiler(() => JSON.stringify); // TODO: disable this

    try {
        await app.register(corePlugin);
        await app.register(modulesPlugin);

        app.get("/healthcheck", { logLevel: "silent" }, async (_, reply) =>
            reply.send({ status: "ok" })
        );

        // Seed database if not in production
        if (process.env.NODE_ENV !== "production") {
            // Error is non-fatal
            await seed(app).catch((error) => app.log.warn({ error }, "Seed failing"));
        }

        return ok(app);
    } catch (error) {
        app.log.error({ error }, "Failed to build server");

        // Safely close the server, trigger all onClose hooks
        app.close();

        if (error instanceof ZodError) {
            return err(new Error(error.issues.map((i) => i.message).join("; ")));
        }

        return err(error as Error);
    }
};

export default buildApp;
