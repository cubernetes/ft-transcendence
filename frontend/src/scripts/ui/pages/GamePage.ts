import { GameMode } from "@darrenkuro/pong-core";
import { gameStore } from "../../modules/game/game.store";

// Obselete, delete after finishing refactor setup page
export const createGamePage = (mode: GameMode) => async (): Promise<HTMLElement[]> => {
    const { controller } = gameStore.get();
    if (controller) {
        controller.startGame(mode);
    }
    return [];
};
