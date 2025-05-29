import type { FastifyInstance } from "fastify";
import { lobbySchema } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import { createLobbyController } from "./lobby.controller.ts";
import { routeSchema } from "./lobby.schema.ts";

export const lobbyRoutes = async (app: FastifyInstance) => {
    const { create, join, update, leave } = createLobbyController(app);

    const { joinParams, updateBody } = lobbySchema;

    // Register routes
    app.post("/create", { preHandler: [app.requireAuth], schema: routeSchema.create }, create);

    app.post(
        "/join/:lobbyId",
        { preHandler: [app.requireAuth], schema: routeSchema.join },
        withZod({ params: joinParams }, join)
    );

    app.post(
        "/update",
        { preHandler: [app.requireAuth], schema: routeSchema.update },
        withZod({ body: updateBody }, update)
    );

    app.post("/leave", { preHandler: [app.requireAuth], schema: routeSchema.leave }, leave);
};
