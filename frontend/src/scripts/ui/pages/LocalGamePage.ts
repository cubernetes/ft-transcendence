import { gameStore } from "../../modules/game/game.store";
import { showPageElements } from "../../modules/layout/layout.service";

export const createLocalGamePage = async (): Promise<HTMLElement[]> => {
    showPageElements();

    const { controller, pongEngine } = gameStore.get();
    if (!controller || !pongEngine) {
        window.log.error("Local game page cannot find essential game components");
        return [];
    }

    // Get a clean state on pong engine
    window.log.debug(pongEngine.getInternalState());
    pongEngine.reset();
    window.log.debug(pongEngine.getInternalState());

    // Attach pong engine events to renderer controller
    pongEngine.onEvent("wall-collision", () => controller.handleWallCollision());
    pongEngine.onEvent("paddle-collision", () => controller.handlePaddleCollision());
    pongEngine.onEvent("score-update", (evt) => controller.updateScores(evt.scores));
    pongEngine.onEvent("state-update", (evt) => {
        controller.updateState(evt.state);
    });

    gameStore.update({ isPlaying: true, mode: "local" });

    const result = pongEngine.start();
    if (result.isOk()) {
        window.log.info("Pong engine ok!");
    }

    controller.start();

    return [];
};
