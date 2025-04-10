import { createStore } from "../../global/store";
import { establishSocketConn } from "../ws/ws.service";
import { createGameController } from "./game.controller";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    isWaiting: boolean;
    mode: "local" | "remote" | "ai" | null;
    gameId: string | null;
    opponentId: number | null;
    index: 0 | 1 | null;
    controller: ReturnType<typeof createGameController> | null;
};

export const defaultGameState: GameState = {
    isPlaying: false,
    isWaiting: false,
    mode: null,
    gameId: null,
    opponentId: null,
    index: null,
    controller: null,
};

export const gameStore = createStore<GameState>(defaultGameState);

gameStore.subscribe((state) => {
    window.log.debug("GameStore subscriber triggered");

    const { controller } = state;
    // Safeguard, should never be triggered
    if (!controller) {
        window.log.error("GameStore cannot find controller");
        return;
    }

    establishSocketConn();
});
