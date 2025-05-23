import type { FastifyInstance, RouteHandlerMethod } from "fastify";
import { defaultGameConfig } from "@darrenkuro/pong-core";
import { lobbySchemas } from "@darrenkuro/pong-core";
import { ZodHandler } from "../../utils/zod-validate";

export const createLobbyController = (app: FastifyInstance) => {
    const create: RouteHandlerMethod = (req, reply) => {
        const { userId, userDisplayName } = req;
        const tryCreateLobby = app.lobbyService.create(userId, userDisplayName, defaultGameConfig);
        if (tryCreateLobby.isErr()) return reply.err(tryCreateLobby.error);

        const lobbyId = tryCreateLobby.value;

        const tryUpdate = app.lobbyService.sendUpdate(lobbyId);
        if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

        return reply.ok({ lobbyId });
    };

    type joinCb = ZodHandler<{ params: typeof lobbySchemas.joinParams }>;
    const join: joinCb = ({ params }, req, reply) => {
        const { userId, userDisplayName } = req;
        const { lobbyId } = params;
        const tryJoinLobby = app.lobbyService.join(userId, userDisplayName, lobbyId);
        if (tryJoinLobby.isErr()) return reply.err(tryJoinLobby.error);

        const tryUpdate = app.lobbyService.sendUpdate(lobbyId);
        if (tryUpdate.isErr()) return reply.err(tryUpdate.error);

        return reply.ok({});
    };

    type updateCb = ZodHandler<{ body: typeof lobbySchemas.updateBody }>;
    const update: updateCb = ({ body }, req, reply) => {
        const { userId } = req;
        const { playTo } = body;
        const tryUpdateLobby = app.lobbyService.update(userId, { playTo });
        if (tryUpdateLobby.isErr()) return reply.err(tryUpdateLobby.error);

        const lobbyId = tryUpdateLobby.value;

        const tryUpdate = app.lobbyService.sendUpdate(lobbyId);
        if (tryUpdate.isErr()) return reply.err(tryUpdate.error);
        return reply.ok({});
    };

    const leave: RouteHandlerMethod = (req, reply) => {
        const { userId } = req;
        const app = req.server;
        const tryLeaveLobby = app.lobbyService.leave(userId);

        // Only log warning and do not send error back since this is used as safe guard
        if (tryLeaveLobby.isErr()) app.log.warn(tryLeaveLobby.error);

        return reply.ok({});
    };

    return { create, join, update, leave };
};
