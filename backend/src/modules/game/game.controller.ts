import type { FastifyInstance, WebSocket } from "fastify";
import { IncomingMessagePayloads as Payloads } from "@darrenkuro/pong-core";

export const createGameController = (app: FastifyInstance) => {
    const start = (conn: WebSocket): void => {
        // Try to get lobby ID from socket
        const { lobbyId } = conn;
        if (!lobbyId) return app.log.error("Tried to start game but not in a lobby");

        // Try to get game session from lobby ID
        const tryGetSession = app.lobbyService.getSessionById(lobbyId);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        const session = tryGetSession.value;
        const { engine, players, playerNames } = session;

        // Guard against wrong number of players
        if (players.length !== 2)
            return app.log.error("Tried to start game with wrong player count");

        // Register event handlers and start the engine
        app.gameService.registerCbHandlers(session);
        engine.start();

        // Broadcast game-started event to all players
        app.wsService.broadcast(players, { type: "game-started", payload: { playerNames } });
    };

    const action = (conn: WebSocket, payload: Payloads["game-action"]): void => {
        // Try to get lobby ID from socket
        const { lobbyId } = conn;
        if (!lobbyId) return app.log.error("Tried to send action but not in a lobby");

        // Try to get game session from lobby ID
        const tryGetSession = app.lobbyService.getSessionById(lobbyId);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        // Get player index from socket, and set user input
        const { engine, players } = tryGetSession.value;
        const index = players.findIndex((p) => p === conn);
        engine.setInput(index, payload.action);
    };

    return { start, action };
};
