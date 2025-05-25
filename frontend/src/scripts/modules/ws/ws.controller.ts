import type {
    OutgoingMessageHandler as Handler,
    OutgoingMessage as Message,
    OutgoingMessageType as Type,
} from "@darrenkuro/pong-core";
import { CLOSING_CODE, defaultGameConfig, safeJsonParse } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { createModal } from "../../ui/components/Modal";
import { createParagraph } from "../../ui/components/Paragraph";
import { gameStore } from "../game/game.store";
import { wsStore } from "./ws.store";

const registerGeneralHandlers = (conn: WebSocket) => {
    conn.onopen = () => log.info("WebSocket connection established");

    conn.onclose = (evt) => {
        log.info(`WebSocket connection closed, code: ${evt.code}`);
        wsStore.update({ isConnected: false, conn: null });

        // Navigate to landing page to ensure data integrity
        navigateTo(CONST.ROUTE.DEFAULT, true);

        if (evt.code === CLOSING_CODE.MULTI_CLIENT) {
            const noticeEl = createParagraph({
                text: "User can only log in a single tab",
            });
            createModal({ children: [noticeEl] });
        }
    };

    conn.onerror = (e) =>
        log.error(`Socket error: ${e instanceof ErrorEvent ? e.message : "unknown"}`);
};

const registerGameControllers = (conn: WebSocket) => {
    const { handlers } = wsStore.get();
    const { controller } = gameStore.get();
    if (!controller) return log.error("Fail to register socket handler: no game controller");

    registerHandler(
        "game-start",
        ({ playerNames }) => {
            gameStore.update({
                isPlaying: true,
                mode: "online",
                status: "ongoing",
                playerNames,
            });
            controller.startGame("online");
        },
        handlers
    );

    registerHandler(
        "lobby-update",
        ({ config, playerNames, host }) => {
            log.debug("receive: lobby-update");
            gameStore.update({ playTo: config.playTo, playerNames });
        },
        handlers
    );

    registerHandler(
        "lobby-remove",
        () => {
            gameStore.update({
                lobbyId: "",
                lobbyHost: false,
                playerNames: ["", ""],
                playTo: defaultGameConfig.playTo,
            });
            navigateTo(CONST.ROUTE.HOME);
        },
        handlers
    );

    // In game handlers will be registered by game controller at online game start time
    // Because the those function exist in game controller that does not exist at this time potentially

    const handleMessage = async (evt: MessageEvent<any>) => {
        // Try to parse socket message to json and guard against invalid format
        const tryParseMessage = await safeJsonParse<Message<Type>>(evt.data);
        if (tryParseMessage.isErr()) return log.error(`Fail to parse socket message: ${evt.data}`);

        // Try to get message type, payload, and guard against empty type
        const { type, payload } = tryParseMessage.value;
        if (!type) return log.error(`Fail to handle socket message: type is null`);

        log.debug(`Message received over socket: ${type}`, payload);

        // Try to get the handler for message type and guard against handler doens't exist
        const handler = wsStore.get().handlers.get(type);
        if (!handler) return log.error(`Unhandled message type: ${type}`);

        // Execute handler for the message
        handler(payload);
    };

    conn.onmessage = handleMessage;
};

export const registerHandler = <T extends Type>(
    type: T,
    handler: Handler<T>,
    handlers: Map<Type, Handler<Type>>
): void => {
    handlers.set(type, handler as Handler<Type>);
};

export const registerControllers = (conn: WebSocket) => {
    registerGeneralHandlers(conn);
    registerGameControllers(conn);
};
