import type { FastifyInstance, WebSocket } from "fastify";
import { IncomingMessagePayloads as Payloads } from "@darrenkuro/pong-core";

export const createGameController = (app: FastifyInstance) => {
    const start = (conn: WebSocket): void => {
        // Try to get game session
        const { userId } = conn;
        const tryGetSession = app.lobbyService.getSessionByUserId(userId!);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        const session = tryGetSession.value;
        const { players, playerNames, engine } = session;

        // Guard against wrong number of players
        if (players.length !== 2) return app.log.error("fail to start game: wrong player count");

        // Register event handlers
        app.gameService.registerCbHandlers(session);

        // Notify the guest player
        app.wsService.send(players[1], { type: "game-start", payload: { playerNames } });
        engine.setStatus("rendering");
    };

    const action = (conn: WebSocket, payload: Payloads["game-action"]): void => {
        // Try to get game session
        const { userId } = conn;
        const tryGetSession = app.lobbyService.getSessionByUserId(userId!);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        // Get player index from socket, and set user input
        const { engine, players } = tryGetSession.value;
        const index = players.findIndex((p) => p === userId);

        if (index !== 0 && index !== 1) return app.log.error("fail to set action: wrong index");
        engine.setInput(index, payload.action);
    };

    const ready = (conn: WebSocket, _: Payloads["renderer-ready"]): void => {
        // Try to get game session
        const { userId } = conn;
        const trySetReady = app.lobbyService.setReady(userId!);
        if (trySetReady.isErr()) return app.log.error(trySetReady.error);
    };

    return { start, action, ready };
};
