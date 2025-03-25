import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { ok, err, Result } from "neverthrow";
import { ZodError } from "zod";
import corePlugin from "../core/core.plugin.ts";
import modulesPlugin from "../modules/modules.plugin.ts";
import { seed } from "../core/db/db.seed.ts";

const buildApp = async (opts: FastifyServerOptions): Promise<Result<FastifyInstance, Error>> => {
    const app = fastify(opts);
    app.setValidatorCompiler(() => () => true); // Disable ajv validation

    try {
        await app.register(corePlugin);
        await app.register(modulesPlugin);

        app.get("/healthcheck", async (_, reply) => reply.send({ status: "ok" }));

        // Seed database if not in production
        if (process.env.NODE_ENV !== "production") {
            // Error is non-fatal
            await seed(app).catch((e) => app.log.warn({ err: e }, "Seed failing"));
        }

        return ok(app);
    } catch (e) {
        // Safely close the server, trigger all onClose hooks
        app.close();

        app.log.error({ err: e }, "Failed to build server");
        if (e instanceof ZodError) {
            return err(new Error(e.issues.map((i) => i.message).join("; ")));
        }

        return err(e as Error);
    }
};

export default buildApp;
