import type { FastifyInstance } from "fastify";
import { lobbySchemas as schemas } from "@darrenkuro/pong-core";
import { withZod } from "../../utils/zod-validate.ts";
import { createLobbyController } from "./lobby.controller.ts";
import route from "./lobby.schema.ts";

export const lobbyRoutes = async (app: FastifyInstance) => {
    const controller = createLobbyController(app);

    // Deconstruct to get shorten variable names
    const { joinParams, updateBody } = schemas;
    const { create, join, update, leave } = controller;

    // Create
    const createOpts = { preHandler: [app.requireAuth], schema: route.create };
    const createHandler = create;

    // Join
    const joinOpts = { preHandler: [app.requireAuth], schema: route.join };
    const joinHandler = withZod({ params: joinParams }, join);

    // Update
    const updateOpts = { preHandler: [app.requireAuth], schema: route.update };
    const updateHandler = withZod({ body: updateBody }, update);

    // Leave
    const leaveOpts = { preHandler: [app.requireAuth], schema: route.leave };
    const leaveHandler = leave;

    // Register routes
    app.post("/create", createOpts, createHandler);
    app.post("/join/:lobbyId", joinOpts, joinHandler);
    app.post("/update", updateOpts, updateHandler);
    app.post("/leave", leaveOpts, leaveHandler);
};
