import { Engine } from "@babylonjs/core";
import { GameMode, PongEngine } from "@darrenkuro/pong-core";
import { createStore } from "../../global/store";
import { hideCanvas, showCanvas } from "../layout/layout.service";
import { wsStore } from "../ws/ws.store";
import { createGameController } from "./game.controller";
import { createGameEventController } from "./game.event";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    isWaiting: boolean;
    mode: GameMode | null;
    gameId: string | null;
    opponentId: number | null;
    index: 0 | 1 | null;
    renderer: Engine | null;
    controller: ReturnType<typeof createGameController> | null;
    pongEngine: PongEngine | null;
    eventController: ReturnType<typeof createGameEventController> | null;
};

export const defaultGameState: GameState = {
    isPlaying: false,
    isWaiting: false,
    mode: null,
    gameId: null,
    opponentId: null,
    index: null,
    renderer: null,
    controller: null,
    pongEngine: null,
    eventController: null,
};

export const gameStore = createStore<GameState>(defaultGameState);

gameStore.subscribe((state) => {
    window.log.debug("GameStore subscriber triggered");
    window.log.debug(state);

    const { renderer, controller, pongEngine, eventController } = state;

    // Safeguard, should never be triggered
    if (!renderer || !controller || !pongEngine || !eventController) {
        window.log.warn("GameStore cannot find essential components");
        return;
    }

    const { isPlaying, mode } = state;

    if (!isPlaying) {
        // Detach all controllers when game is not ongoing
        eventController.detachAllControls();
        controller.destory();
        pongEngine.stop();
        hideCanvas();
        return;
    }

    if (isPlaying && !mode) {
        window.log.error("GameStore subscriber find game session without a mode");
        return;
    }

    // A game is now ongoing with a valid mode
    showCanvas();

    const attachLocalEngineEvents = () => {
        pongEngine.onEvent("wall-collision", () => controller.handleWallCollision());
        pongEngine.onEvent("paddle-collision", () => controller.handlePaddleCollision());
        pongEngine.onEvent("score-update", (evt) => controller.updateScores(evt.scores));
        pongEngine.onEvent("state-update", (evt) => {
            controller.updateState(evt.state);
        });
    };

    switch (mode) {
        case "local":
            // Attach key event controllers
            eventController.attachLocalControl();

            // Attach game event to renderer
            attachLocalEngineEvents();

            // Start pong engine and renderer
            pongEngine.start();
            controller.start();
            break;
        case "online":
            const { isConnected } = wsStore.get();
            if (!isConnected) {
                window.log.error("Online game ongoing but socket is not connected");
                return;
            }

            // Attach key event controllers
            eventController.attachOnlineControl();

            // Start renderer
            controller.start();

            break;
        case "ai":
            // Attach key event controllers
            eventController.attachAiControl();

            // Attach game event to renderer
            attachLocalEngineEvents();

            // Start pong engine and renderer
            // Will config AI to pongEngine here
            pongEngine.start();
            controller.start();
            break;
        default:
    }
});
