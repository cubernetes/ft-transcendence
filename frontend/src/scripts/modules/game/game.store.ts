import { createStore } from "../../global/store";
import { createGameController } from "./game.controller";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    isWaiting: boolean;
    gameId: string | null;
    opponentId: number | null;
    index: 0 | 1 | null;
    controller: ReturnType<typeof createGameController> | null;
};

export const defaultGameState: GameState = {
    isPlaying: false,
    isWaiting: false,
    gameId: null,
    opponentId: null,
    index: null,
    controller: null,
};

export const gameStore = createStore<GameState>(defaultGameState);

gameStore.subscribe((state) => {
    window.log.debug("GameStore subscriber triggered");

    const { isPlaying, controller } = state;

    if (!isPlaying && controller) {
        controller.destory();
    }
});
