import type { FastifyInstance, WebSocket } from "fastify";
import { IncomingMessagePayloads as Payloads } from "@darrenkuro/pong-core";

export const createLobbyController = (app: FastifyInstance) => {
    const create = (conn: WebSocket, payload: Payloads["lobby-create"]): void => {
        const { config } = payload; // TODO: where are they checking integrity of the payload??
        const tryCreateLobby = app.lobbyService.create(conn, config);
        if (tryCreateLobby.isErr()) return app.log.error(tryCreateLobby.error);

        const lobbyId = tryCreateLobby.value;
        return app.wsService.send(conn, {
            type: "lobby-created",
            payload: { lobbyId },
        });
    };

    const join = (conn: WebSocket, payload: Payloads["lobby-join"]): void => {
        const { lobbyId } = payload; // TODO: where are they checking integrity of the payload??
        const tryJoinLobby = app.lobbyService.join(conn, lobbyId);
        if (tryJoinLobby.isErr()) return app.log.error(tryJoinLobby.error);

        const { engine, playerNames } = tryJoinLobby.value;
        const config = engine.getConfig();

        // TODO: send back info for the other person??
        return app.wsService.send(conn, {
            type: "lobby-joined",
            payload: { config, playerNames },
        });
    };

    const update = (_: WebSocket, payload: Payloads["lobby-update"]): void => {};

    const leave = (conn: WebSocket): void => {};

    return { create, join, update, leave };
};
