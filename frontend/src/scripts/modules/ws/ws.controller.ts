import { Result, err, ok } from "neverthrow";
import {
    OutgoingMessage,
    OutgoingMessagePayloads,
    OutgoingMessageType,
} from "@darrenkuro/pong-core";
import { safeParseJSON } from "../../utils/api";
import { gameStore } from "../game/game.store";

type MessageHandler<T extends OutgoingMessageType> = (payload: OutgoingMessagePayloads[T]) => void;
const handlers = new Map<OutgoingMessageType, MessageHandler<OutgoingMessageType>>();

/** Properly typed register handler. */
const registerHandler = <T extends OutgoingMessageType>(
    type: T,
    handler: MessageHandler<T>
): void => {
    handlers.set(type, handler as MessageHandler<OutgoingMessageType>);
};

const getHandler = <T extends OutgoingMessageType>(type: T): Result<MessageHandler<T>, Error> => {
    if (!handlers.has(type)) {
        return err(new Error(`Handler for type ${type} not found`));
    }
    return ok(handlers.get(type) as MessageHandler<T>);
};

const registerGeneralHandlers = (conn: WebSocket) => {
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

const registerPregameControllers = () => {
    registerHandler("game-start", ({ gameId, opponentId, index }) => {
        gameStore.update({
            isPlaying: true,
            isWaiting: false,
            mode: "remote",
            gameId,
            opponentId,
            index,
        });
    });

    registerHandler("waiting-for-opponent", () => {
        window.log.info(`Waiting for opponent...`);
        // Animation or something? Lobby?
    });
};

// There is a persistance problem because controller and renderer are consitently built and disposed
const registerIngameControllers = () => {
    const { controller } = gameStore.get();
    if (!controller) {
        window.log.error(
            "Game controller is null when trying to register socket ingame controllers"
        );
        return;
    }

    registerHandler("wall-collision", () => {
        controller.handleWallCollision();
    });

    registerHandler("paddle-collision", () => {
        controller.handlePaddleCollision();
    });

    registerHandler("state-update", ({ state }) => {
        controller.updateState(state);
    });

    registerHandler("score-update", ({ scores }) => {
        controller.updateScores(scores);
    });

    registerHandler("ball-reset", () => {
        controller.handleBallReset();
    });

    registerHandler("game-end", ({ winner }) => {
        controller.handleEndGame("winnerName");
    });
};

export const handleMessage = (evt: MessageEvent<any>) => {
    const result = safeParseJSON<OutgoingMessage<OutgoingMessageType>>(evt.data);
    if (result.isErr()) {
        window.log.error(`Fail to parse socket message: ${evt.data}`);
        return;
    }

    const { type } = result.value;
    if (!type) {
        window.log.error(`Fail to handle socket message without a type: ${result.value}`);
        return;
    }

    const handler = getHandler(type);

    if (handler.isErr()) {
        window.log.error(`Unhandled message type: ${type}`);
        return;
    }

    handler.value(result.value.payload);
};

export const registerControllers = (conn: WebSocket) => {
    registerGeneralHandlers(conn);
    // TODO: Game stuff, with engine, canvas, controller, renderer
    conn.onmessage = handleMessage;
};
