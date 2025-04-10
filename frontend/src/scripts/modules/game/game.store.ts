import { Engine } from "@babylonjs/core";
import { createStore } from "../../global/store";
import { createGameController } from "./game.controller";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    isWaiting: boolean;
    mode: "local" | "remote" | "ai" | null;
    gameId: string | null;
    opponentId: number | null;
    index: 0 | 1 | null;
    canvas: HTMLCanvasElement | null;
    renderer: Engine | null;
    controller: ReturnType<typeof createGameController> | null;
};

export const defaultGameState: GameState = {
    isPlaying: false,
    isWaiting: false,
    mode: null,
    gameId: null,
    opponentId: null,
    index: null,
    canvas: null,
    renderer: null,
    controller: null,
};

export const gameStore = createStore<GameState>(defaultGameState);
