import { GameMode } from "@darrenkuro/pong-core";
import { gameStore } from "../../modules/game/game.store";
import { hidePageElements, showPageElements } from "../../modules/layout/layout.service";

// This actually doesn't have any UI so probably shouldn't be a page
// Can add into controller directly and trigger UI change automatically
// signature is locked in with router and it's annoying, maybe after finishing setup page to call it directly
export const createGamePage = (mode: GameMode) => async (): Promise<HTMLElement[]> => {
    hidePageElements();

    const { controller, pongEngine } = gameStore.get();
    if (!controller || !pongEngine) {
        window.log.error("Local game page cannot find essential game components");
        return [];
    }

    // Start the game and let subscribe handle the rest
    gameStore.update({ isPlaying: true, mode: mode });

    return [];
};
