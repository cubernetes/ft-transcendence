import type { OutgoingMessage, OutgoingMessageType } from "@darrenkuro/pong-core";
import {
    registerOutgoingMessageHandler as registerHandler,
    safeJsonParse,
} from "@darrenkuro/pong-core";
import { authStore } from "../auth/auth.store";
import { gameStore } from "../game/game.store";
import { wsStore } from "./ws.store";

const registerGeneralHandlers = (conn: WebSocket) => {
    conn.onopen = () => window.log.info("WebSocket connection established");

    conn.onclose = () => window.log.info("WebSocket connection closed");

    conn.onerror = (e) =>
        window.log.info(`Socket error: ${e instanceof ErrorEvent ? e.message : "unknown"}`);
};

const registerGameControllers = (conn: WebSocket) => {
    const { handlers } = wsStore.get();

    registerHandler(
        "game-start",
        ({ gameId, opponentId, playerNames, index }) => {
            gameStore.update({
                isPlaying: true,
                isWaiting: false,
                gameId,
                opponentId,
                playerNames,
                index,
            });
        },
        handlers
    );

    registerHandler(
        "waiting-for-opponent",
        () => {
            window.log.info(`Waiting for opponent...`);
            // Animation or something? Lobby?
        },
        handlers
    );

    // In game handlers will be registered by game controller at online game start time

    const handleMessage = (evt: MessageEvent<any>) => {
        // Try to parse socket message to json and guard against invalid format
        const tryParseMessage = safeJsonParse<OutgoingMessage<OutgoingMessageType>>(evt.data);
        if (tryParseMessage.isErr())
            return window.log.error(`Fail to parse socket message: ${evt.data}`);

        // Try to get message type, payload, and guard against empty type
        const { type, payload } = tryParseMessage.value;
        if (!type) return window.log.error(`Fail to handle socket message: type is null`);

        // Try to get the handler for message type and guard against handler doens't exist
        const handler = wsStore.get().handlers.get(type);
        if (!handler) return window.log.error(`Unhandled message type: ${type}`);

        // Execute handler for the message
        handler(payload);
    };

    conn.onmessage = handleMessage;
};

export const registerControllers = (conn: WebSocket) => {
    registerGeneralHandlers(conn);
    registerGameControllers(conn);
};
