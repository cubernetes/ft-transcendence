import type { OutgoingMessage, OutgoingMessageType } from "@darrenkuro/pong-core";
import { Result, err, ok } from "neverthrow";
import {
    registerOutgoingMessageHandler as registerHandler,
    safeJsonParse,
} from "@darrenkuro/pong-core";
import { gameStore } from "../game/game.store";
import { wsStore } from "./ws.store";

export const registerGeneralHandlers = (conn: WebSocket) => {
    if (!conn) {
        window.log.warn("Socket is null when trying to register general handlers");
        return;
    }

    conn.onopen = () => {
        window.log.info("WebSocket connection established");
    };

    conn.onerror = (error) => {
        if (error instanceof ErrorEvent) {
            window.log.debug(`Websocket error: ${error.message}`);
        } else {
            window.log.debug(`Websocket error: unknown`);
        }
    };

    conn.onclose = () => {
        window.log.info("WebSocket connection closed");
    };
};

export const registerGameControllers = (conn: WebSocket) => {
    const { handlers } = wsStore.get();

    registerHandler(
        "game-start",
        ({ gameId, opponentId, index }) => {
            gameStore.update({
                isPlaying: true,
                isWaiting: false,
                gameId,
                opponentId,
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
        const result = safeJsonParse<OutgoingMessage<OutgoingMessageType>>(evt.data);
        if (result.isErr()) {
            window.log.error(`Fail to parse socket message: ${evt.data}`);
            return;
        }

        const { type } = result.value;
        if (!type) {
            window.log.error(`Fail to handle socket message without a type: ${result.value}`);
            return;
        }

        const handler = wsStore.get().handlers.get(type);

        if (!handler) {
            window.log.error(`Unhandled message type: ${type}`);
            return;
        }

        handler(result.value.payload);
    };

    conn.onmessage = handleMessage;
};

export const registerControllers = (conn: WebSocket) => {
    registerGeneralHandlers(conn);
    registerGameControllers(conn);
};
