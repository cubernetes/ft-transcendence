import { GameMode } from "@darrenkuro/pong-core";
import { gameStore } from "../../modules/game/game.store";
import { showPageElements } from "../../modules/layout/layout.service";

export const createGamePage = (mode: GameMode) => async (): Promise<HTMLElement[]> => {
    showPageElements();

    const { controller, pongEngine } = gameStore.get();
    if (!controller || !pongEngine) {
        window.log.error("Local game page cannot find essential game components");
        return [];
    }

    // Start the game and let subscribe handle the rest
    gameStore.update({ isPlaying: true, mode: mode });

    return [];
};
