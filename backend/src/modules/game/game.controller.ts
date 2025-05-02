import type { FastifyInstance, WebSocket } from "fastify";
import { IncomingMessagePayloads as Payloads } from "@darrenkuro/pong-core";

export const createGameController = (app: FastifyInstance) => {
    const start = (conn: WebSocket): void => {
        // Try to get game session
        const { userId } = conn;
        const tryGetSession = app.lobbyService.getSessionByUserId(userId!);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        const session = tryGetSession.value;
        const { engine, players, playerNames } = session;

        // Guard against wrong number of players
        if (players.length !== 2) return app.log.error("Fail to start game: wrong player count");

        // Register event handlers and start the engine
        app.gameService.registerCbHandlers(session);
        engine.start();

        // Broadcast game-started event to all players
        app.wsService.broadcast(players, { type: "game-start", payload: { playerNames } });
    };

    const action = (conn: WebSocket, payload: Payloads["game-action"]): void => {
        // Try to get game session
        const { userId } = conn;
        const tryGetSession = app.lobbyService.getSessionByUserId(userId!);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        // Get player index from socket, and set user input
        const { engine, players } = tryGetSession.value;
        const index = players.findIndex((p) => p === userId);

        if (index !== 0 && index !== 1) return app.log.error("Fail to set action: wrong index");
        engine.setInput(index, payload.action);
    };

    return { start, action };
};
