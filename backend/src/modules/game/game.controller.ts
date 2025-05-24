import type { FastifyInstance, WebSocket } from "fastify";
import { IncomingMessagePayloads as Payloads } from "@darrenkuro/pong-core";
import { createModuleLogger } from "../../utils/logger.ts";

export const createGameController = (app: FastifyInstance) => {
    const logger = createModuleLogger(app.log, "game");

    const start = (conn: WebSocket): void => {
        logger.info(
            {
                event_type: "game_start_attempt",
                user_id: conn.userId,
                username: conn.username,
                tags: ["game_activity", "game_start"],
            },
            `Game start attempt by user ${conn.userId}`
        );

        // Try to get game session
        const { userId } = conn;
        const tryGetSession = app.lobbyService.getSessionByUserId(userId!);
        if (tryGetSession.isErr()) {
            logger.error(
                {
                    event_type: "game_start_failed",
                    user_id: userId,
                    username: conn.username,
                    reason: "session_not_found",
                    error_code: tryGetSession.error,
                    tags: ["game_activity", "game_start", "error"],
                },
                `Game start failed: ${tryGetSession.error}`
            );
            return;
        }

        const session = tryGetSession.value;
        const { players, playerNames, engine } = session;

        // Guard against wrong number of players
        if (players.length !== 2) {
            logger.error(
                {
                    event_type: "game_start_failed",
                    user_id: userId,
                    username: conn.username,
                    reason: "invalid_player_count",
                    player_count: players.length,
                    players: players,
                    tags: ["game_activity", "game_start", "error"],
                },
                `Game start failed: wrong player count (${players.length})`
            );
            return;
        }

        // Register event handlers
        app.gameService.registerCbHandlers(session);

        // Notify the guest player
        app.wsService.send(players[1], { type: "game-start", payload: { playerNames } });
        engine.setStatus("rendering");

        logger.info(
            {
                event_type: "game_started",
                user_id: userId,
                username: conn.username,
                players: players,
                player_names: playerNames,
                tags: ["game_activity", "game_start", "success"],
            },
            `Game started successfully with players: ${playerNames.join(" vs ")}`
        );
    };

    const action = (conn: WebSocket, payload: Payloads["game-action"]): void => {
        logger.debug(
            {
                event_type: "game_action_received",
                user_id: conn.userId,
                username: conn.username,
                action: payload.action,
                tags: ["game_activity", "game_action"],
            },
            `Game action received: ${payload.action} from user ${conn.userId}`
        );

        // Try to get game session
        const { userId } = conn;
        const tryGetSession = app.lobbyService.getSessionByUserId(userId!);
        if (tryGetSession.isErr()) {
            logger.error(
                {
                    event_type: "game_action_failed",
                    user_id: userId,
                    username: conn.username,
                    action: payload.action,
                    reason: "session_not_found",
                    error_code: tryGetSession.error,
                    tags: ["game_activity", "game_action", "error"],
                },
                `Game action failed: ${tryGetSession.error}`
            );
            return;
        }

        // Get player index from socket, and set user input
        const { engine, players } = tryGetSession.value;
        const index = players.findIndex((p) => p === userId);

        if (index !== 0 && index !== 1) {
            logger.error(
                {
                    event_type: "game_action_failed",
                    user_id: userId,
                    username: conn.username,
                    action: payload.action,
                    reason: "invalid_player_index",
                    player_index: index,
                    players: players,
                    tags: ["game_activity", "game_action", "error"],
                },
                `Game action failed: invalid player index (${index})`
            );
            return;
        }

        engine.setInput(index, payload.action);

        logger.trace(
            {
                event_type: "game_action_processed",
                user_id: userId,
                username: conn.username,
                action: payload.action,
                player_index: index,
                tags: ["game_activity", "game_action", "success"],
            },
            `Game action processed: ${payload.action} for player ${index}`
        );
    };

    const ready = (conn: WebSocket, _: Payloads["renderer-ready"]): void => {
        logger.info(
            {
                event_type: "player_ready",
                user_id: conn.userId,
                username: conn.username,
                tags: ["game_activity", "player_ready"],
            },
            `Player ready signal from user ${conn.userId}`
        );

        // Try to get game session
        const { userId } = conn;
        const trySetReady = app.lobbyService.setReady(userId!);
        if (trySetReady.isErr()) {
            logger.error(
                {
                    event_type: "player_ready_failed",
                    user_id: userId,
                    username: conn.username,
                    reason: "set_ready_failed",
                    error_code: trySetReady.error,
                    tags: ["game_activity", "player_ready", "error"],
                },
                `Player ready failed: ${trySetReady.error}`
            );
            return;
        }

        logger.debug(
            {
                event_type: "player_ready_processed",
                user_id: userId,
                username: conn.username,
                tags: ["game_activity", "player_ready", "success"],
            },
            `Player ready processed for user ${conn.userId}`
        );
    };

    return { start, action, ready };
};
