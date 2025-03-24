import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import corePlugin from "../core/core.plugin.ts";
import modulesPlugin from "../modules/modules.plugin.ts";
import { ok, error, Result } from "./errors.ts";
import { seed } from "../core/db/db.seed.ts";

const buildApp = async (
    opts: FastifyServerOptions,
    test: boolean = false
): Promise<Result<FastifyInstance, Error>> => {
    const app = fastify(opts);
    app.setValidatorCompiler(() => () => true); // Disable ajv validation

    try {
        await app.register(corePlugin);
        await app.register(modulesPlugin);

        app.get("/healthcheck", async (_, reply) => reply.status(200).send({ status: "ok" }));

        // In test mode with tap, no need to start or listen to the server
        if (test) {
            return ok(app);
        }

        // Seed database if not in production
        if (process.env.NODE_ENV !== "production") {
            // Error is non-fatal
            await seed(app).catch((err) => app.log.warn({ err }, "Seed failing"));
        }

        const { port, host } = app.config;
        await app.listen({ port, host });
        app.log.info(`Server running at port ${port}!`);

        return ok(app);
    } catch (err) {
        // Safely close the server, trigger all onClose hooks
        app.close();

        app.log.error({ err }, "Failed to start server");
        return error(err as Error); // TODO: Map error function!
    }
};

export default buildApp;
