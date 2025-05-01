import type { FastifyInstance, WebSocket } from "fastify";
import { IncomingMessagePayloads as Payloads } from "@darrenkuro/pong-core";

export const createGameController = (app: FastifyInstance) => {
    const start = (conn: WebSocket): void => {
        const { lobbyId } = conn;
        if (!lobbyId) return app.log.error("Tried to start game but not in a lobby");

        const tryGetSession = app.lobbyService.getSessionById(lobbyId);
        if (tryGetSession.isErr()) return app.log.error(tryGetSession.error);

        const { engine, players } = tryGetSession.value;

        // Guard against not enough players
        if (players.length !== 2)
            return app.log.error("Tried to start game with wrong player count");

        engine.start();
        app.wsService.broadcast(players, {
            type: "game-started",
            payload: { playerNames },
        });

        app.wsService.send(players[1], {
            type: "game-start",
            payload: {
                gameId: id,
                opponentId: players[0].userId!,
                opponentName: players[0].userDisplayName!,
                index: 1,
            },
        });
    };

    const action = (_: WebSocket, payload: Payloads["game-action"]): void => {
        const { gameId, index, action } = payload;
        app.gameService.setUserInput(gameId, index, action);
    };

    return { start, action };
};
