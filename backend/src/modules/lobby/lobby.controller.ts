import type { FastifyInstance, WebSocket } from "fastify";
import { IncomingMessagePayloads as Payloads } from "@darrenkuro/pong-core";

export const createLobbyController = (app: FastifyInstance) => {
    const create = (conn: WebSocket, payload: Payloads["lobby-create"]): void => {
        const { config } = payload; // TODO: where are they checking integrity of the payload??
        const tryCreateLobby = app.lobbyService.create(conn, config);
        if (tryCreateLobby.isErr()) return app.log.error(tryCreateLobby.error);

        const lobbyId = tryCreateLobby.value;
        app.wsService.send(conn, { type: "lobby-created", payload: { lobbyId } });
    };

    const join = (conn: WebSocket, payload: Payloads["lobby-join"]): void => {
        const { lobbyId } = payload; // TODO: where are they checking integrity of the payload??
        const tryJoinLobby = app.lobbyService.join(conn, lobbyId);
        if (tryJoinLobby.isErr()) return app.log.error(tryJoinLobby.error);

        const { engine, playerNames, players } = tryJoinLobby.value;
        const config = engine.getConfig();

        app.wsService.broadcast(players, {
            type: "lobby-updated",
            payload: { config, playerNames },
        });
    };

    const update = (conn: WebSocket, payload: Payloads["lobby-update"]): void => {
        // Try to get lobby ID from socket
        const { lobbyId } = conn;
        if (!lobbyId) return app.log.error("Tried to update lobby but not in a lobby");

        // Try to get game session from lobby ID
        const tryGetSession = app.lobbyService.getSessionById(lobbyId);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        const session = tryGetSession.value;
        const { engine, players, playerNames } = session;

        // Check if user has access (only host who created the room can update)
        const isHost = players[0] === conn;
        if (!isHost) return app.log.warn("Tried to update lobby but not the host");

        engine.reset(payload.config);

        const config = engine.getConfig();
        app.wsService.broadcast(players, {
            type: "lobby-updated",
            payload: { config, playerNames },
        });
    };

    const leave = (conn: WebSocket): void => {};

    return { create, join, update, leave };
};
