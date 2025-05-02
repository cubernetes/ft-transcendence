import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withZod } from "../../utils/zod-validate.ts";
import { createLobbyController } from "./lobby.controller.ts";

// import route from "./lobby.schema.ts";
export const joinParams = z.object({ lobbyId: z.string().length(6) });
export const updateBody = z.object({ config: z.object({ playTo: z.number() }) });

export const lobbyRoutes = async (app: FastifyInstance) => {
    const controller = createLobbyController(app);

    // Create
    const createOpts = { preHandler: [app.requireAuth] };
    const createHandler = controller.create;

    // Join
    const joinOpts = { preHandler: [app.requireAuth] };
    const joinHandler = withZod({ params: joinParams }, controller.join);

    // Update
    const updateOpts = { preHandler: [app.requireAuth] };
    const updateHandler = withZod({ body: updateBody }, controller.update);

    // Leave
    const leaveOpts = { preHandler: [app.requireAuth] };
    const leaveHandler = controller.leave;

    // Register routes
    app.post("/create", createOpts, createHandler);
    app.post("/join/:id", joinOpts, joinHandler);
    app.post("/update", updateOpts, updateHandler);
    app.post("/leave", leaveOpts, leaveHandler);
};
