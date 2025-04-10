import { Engine } from "@babylonjs/core";
import { PongEngine } from "@darrenkuro/pong-core";
import { createStore } from "../../global/store";
import { createGameController } from "./game.controller";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    isWaiting: boolean;
    gameId: string | null;
    opponentId: number | null;
    index: 0 | 1 | null;
    renderer: Engine | null;
    controller: ReturnType<typeof createGameController> | null;
    engine: PongEngine | null;
};

export const defaultGameState: GameState = {
    isPlaying: false,
    isWaiting: false,
    gameId: null,
    opponentId: null,
    index: null,
    renderer: null,
    controller: null,
    engine: null,
};

export const gameStore = createStore<GameState>(defaultGameState);

gameStore.subscribe((state) => {
    window.log.debug("GameStore subscriber triggered");

    const { isPlaying, gameId, controller } = state;

    if (isPlaying && gameId) {
        controller
            ? controller.startGame("online")
            : window.log.error("Staring oneline game but no game controller available");
    }

    if (!isPlaying && controller) {
        controller.destory();
    }
});
