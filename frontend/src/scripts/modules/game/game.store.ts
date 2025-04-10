import { Engine } from "@babylonjs/core";
import { PongEngine } from "@darrenkuro/pong-core";
import { createStore } from "../../global/store";
import { hideCanvas, showCanvas } from "../layout/layout.service";
import { establishSocketConn } from "../ws/ws.service";
import { createGameController } from "./game.controller";
import { createGameEventController } from "./game.event";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    isWaiting: boolean;
    mode: "local" | "remote" | "ai" | null;
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

    const { renderer, controller, pongEngine, eventController } = state;

    // Safeguard, should never be triggered
    if (!renderer || !controller || !pongEngine || !eventController) {
        window.log.error("GameStore cannot find essential components");
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

    // A game is ongoing with a valid mode
    showCanvas();

    switch (mode) {
        case "local":
            eventController.attachLocalControl();
            controller.start();
            break;
        case "remote":
            // Ensure there is a socket connection, maybe move this somewhere else
            establishSocketConn();
            eventController.attachRemoteControl();
            break;
        case "ai":
            eventController.attachAiControl();
            break;
        default:
    }
});
