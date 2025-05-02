import type {
    OutgoingMessageHandler as Handler,
    OutgoingMessage as Message,
    OutgoingMessageType as Type,
} from "@darrenkuro/pong-core";
import { safeJsonParse } from "@darrenkuro/pong-core";
import { authStore } from "../auth/auth.store";
import { gameStore } from "../game/game.store";
import { wsStore } from "./ws.store";

const registerGeneralHandlers = (conn: WebSocket) => {
    conn.onopen = () => window.log.info("WebSocket connection established");

    conn.onclose = () => window.log.info("WebSocket connection closed");

    conn.onerror = (e) =>
        window.log.info(`Socket error: ${e instanceof ErrorEvent ? e.message : "unknown"}`);
};

export const registerHandler = <T extends Type>(
    type: T,
    handler: Handler<T>,
    handlers: Map<Type, Handler<Type>>
): void => {
    handlers.set(type, handler as Handler<Type>);
};

const registerGameControllers = (conn: WebSocket) => {
    const { handlers } = wsStore.get();

    registerHandler(
        "game-start",
        ({ playerNames }) => {
            gameStore.update({
                isPlaying: true,
                isWaiting: false,
                playerNames,
            });
        },
        handlers
    );

    // In game handlers will be registered by game controller at online game start time
    // Because the those function exist in game controller that does not exist at this time potentially

    const handleMessage = (evt: MessageEvent<any>) => {
        // Try to parse socket message to json and guard against invalid format
        const tryParseMessage = safeJsonParse<Message<Type>>(evt.data);
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
