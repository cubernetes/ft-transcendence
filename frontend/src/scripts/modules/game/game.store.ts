import { Engine } from "@babylonjs/core";
import { createStore } from "../../global/store";
import { createGameController } from "./game.controller";
import { createRenderer, disposeRenderer } from "./game.renderer";

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

// const maybeInitGameRenderer = async () => {
//     const state = gameStore.get();
//     if ((state.isPlaying || state.isWaiting) && !state.controller && state.canvas) {
//         const renderer = await createRenderer(state.canvas);
//         const controller = createGameController(renderer);
//         gameStore.set({
//             ...state,
//             renderer,
//             controller,
//         });
//     }
// };

// /** Whenever isPlaying is toggled, renderer and controller will be created or disposed */
// gameStore.subscribe((state) => {
//     maybeInitGameRenderer();
//     if (!state.isPlaying && !state.isWaiting && state.renderer) {
//         disposeRenderer(state.renderer);
//         gameStore.set({
//             ...state,
//             renderer: null,
//             controller: null,
//         });
//     }
// });
