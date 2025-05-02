import { createStore } from "../../global/store";
import { createGameController } from "./game.controller";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    isWaiting: boolean;
    playerNames: string[];
    controller: ReturnType<typeof createGameController> | null;
};

export const defaultGameState: GameState = {
    isPlaying: false,
    isWaiting: false,
    playerNames: ["", ""],
    controller: null,
};

export const gameStore = createStore<GameState>(defaultGameState);

gameStore.subscribe((state) => {
    window.log.debug("GameStore subscriber triggered");

    const { isPlaying, controller } = state;

    if (!isPlaying && controller) {
        controller.destroy(); // Should be safe to call regardless
    }
});
