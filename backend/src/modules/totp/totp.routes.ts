import type { FastifyInstance } from "fastify";
import { totpSchemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import { createTotpController } from "./totp.controller.ts";
import { routeSchema } from "./totp.schema.ts";

export const totpRoutes = async (app: FastifyInstance) => {
    const { setup, verify, update, disable } = createTotpController(app);
    app.get("/setup", { preHandler: [app.requireAuth], schema: routeSchema.setup }, setup);

    app.post(
        "/verify",
        { preHandler: [app.requireAuth], schema: routeSchema.verify },
        withZod({ body: totpSchemas.totpBody }, verify)
    );

    app.post(
        "/update",
        { preHandler: [app.requireAuth], schema: routeSchema.update },
        withZod({ body: totpSchemas.totpUpdateBody }, update)
    );

    app.post(
        "/disable",
        { preHandler: [app.requireAuth], schema: routeSchema.disable },
        withZod({ body: totpSchemas.totpBody }, disable)
    );
};
