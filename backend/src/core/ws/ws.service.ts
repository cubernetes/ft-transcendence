import type { FastifyInstance, WebSocket } from "fastify";
import { LocalGamePayload, MessageType } from "./ws.types.ts";
import { Result, err, ok } from "neverthrow";

export const createWsService = (_: FastifyInstance) => {
    const handleAuth = (
        conn: WebSocket,
        server: FastifyInstance,
        payload: any
    ): Result<void, Error> => {
        return ok();
    };

    const handleLocalGame = (
        conn: WebSocket,
        server: FastifyInstance,
        payload: LocalGamePayload
    ): Result<void, Error> => {
        // Start new local game if session doesn't exist
        if (!conn.localPongSession) {
            const result = server.pongService.startLocalGame(conn);
            return result.isOk() ? ok() : err(result.error);
        }

        const result = server.pongService.updateLocalGame(conn, payload);
        return result.isOk() ? ok() : err(result.error);
    };

    const handleRemoteGame = (
        conn: WebSocket,
        server: FastifyInstance,
        payload: any
    ): Result<void, Error> => {
        return ok();
    };

    const messageHandlers: Record<
        MessageType,
        (conn: WebSocket, server: FastifyInstance, payload: any) => Result<void, Error>
    > = { auth: handleAuth, "local-game": handleLocalGame, "remote-game": handleRemoteGame };

    return { messageHandlers };
};
