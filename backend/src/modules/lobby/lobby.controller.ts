import type { FastifyInstance, RouteHandlerMethod } from "fastify";
import { defaultGameConfig } from "@darrenkuro/pong-core";
import { lobbySchemas } from "@darrenkuro/pong-core";
import { ZodHandler } from "../../utils/zod-validate";

export const createLobbyController = (app: FastifyInstance) => {
    const create: RouteHandlerMethod = (req, reply) => {
        const { userId } = req;
        const tryCreateLobby = app.lobbyService.create(userId, defaultGameConfig);
        if (tryCreateLobby.isErr()) return reply.err(tryCreateLobby.error);

        const lobbyId = tryCreateLobby.value;
        reply.ok({ lobbyId });
    };

    type joinCb = ZodHandler<{ params: typeof lobbySchemas.joinParams }>;
    const join: joinCb = ({ params }, req, reply) => {
        const { userId } = req;
        const { lobbyId } = params;
        const tryJoinLobby = app.lobbyService.join(userId, lobbyId);
        if (tryJoinLobby.isErr()) return reply.err(tryJoinLobby.error);

        app.lobbyService.sendUpdate(lobbyId);
        reply.ok({});
    };

    type updateCb = ZodHandler<{ body: typeof lobbySchemas.updateBody }>;
    const update: updateCb = ({ body }, req, reply) => {
        const { userId } = req;
        const tryUpdateLobby = app.lobbyService.update(userId, body.config);
        if (tryUpdateLobby.isErr()) return reply.err(tryUpdateLobby.error);

        const lobbyId = tryUpdateLobby.value;
        app.lobbyService.sendUpdate(lobbyId);
        reply.ok({});
    };

    const leave: RouteHandlerMethod = (req, reply) => {
        const { userId } = req;
        const tryLeaveLobby = app.lobbyService.leave(userId);
        if (tryLeaveLobby.isErr()) return reply.err(tryLeaveLobby.error);

        reply.ok({});
    };

    return { create, join, update, leave };
};
