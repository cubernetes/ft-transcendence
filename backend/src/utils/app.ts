import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { ok, err, Result } from "neverthrow";
import corePlugin from "../core/core.plugin.ts";
import modulesPlugin from "../modules/modules.plugin.ts";
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

        // Seed database if not in production & not in test mode
        if (process.env.NODE_ENV !== "production" && !test) {
            if ((await app.userService.getCount()) === 0) {
                // Error is non-fatal
                await seed(app).catch((err) => app.log.warn({ err }, "Seed failing"));
            }
        }

        return ok(app);
    } catch (e) {
        // Safely close the server, trigger all onClose hooks
        app.close();

        app.log.error({ err: e }, "Failed to start server");
        return err(e as Error); // this could be ZodError, or Error
    }
};

export default buildApp;
