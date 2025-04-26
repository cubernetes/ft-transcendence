import type { FastifyPluginAsync } from "fastify";
import { schemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import handlers from "./totp.controller.ts";
import routeSchemas from "./totp.schema.ts";

const totpRoutes: FastifyPluginAsync = async (app) => {
    app.get(
        "/setup",
        { preHandler: [app.requireAuth], schema: routeSchemas.setup },
        handlers.setup
    );

    app.post(
        "/verify",
        { preHandler: [app.requireAuth], schema: routeSchemas.verify },
        withZod({ body: schemas.totpBody }, handlers.verify)
    );

    app.post(
        "/update",
        { preHandler: [app.requireAuth], schema: routeSchemas.update },
        withZod({ body: schemas.totpBody }, handlers.update)
    );

    app.post(
        "/disable",
        { preHandler: [app.requireAuth], schema: routeSchemas.disable },
        withZod({ body: schemas.totpBody }, handlers.disable)
    );
};

export default totpRoutes;
