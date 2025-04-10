import { gameStore } from "../../modules/game/game.store";
import { showPageElements } from "../../modules/layout/layout.service";

export const createLocalGamePage = async (): Promise<HTMLElement[]> => {
    showPageElements();

    const { controller, pongEngine, renderer } = gameStore.get();
    if (!controller || !pongEngine || !renderer) {
        window.log.error("Local game page cannot find essential game components");
        return [];
    }

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

    renderer.runRenderLoop(() => {
        renderer.scene.render();
    });

    // Handle resize event
    const resizeListener = () => renderer.resize();
    window.addEventListener("resize", resizeListener);

    // Initial scale
    requestAnimationFrame(() => renderer.resize());

    // Cleanup function
    const cleanup = () => {
        // Clean up event listeners
        window.removeEventListener("resize", resizeListener);

        pongEngine.stop();
        gameStore.update({ isPlaying: false, mode: null });
        window.log.info("Game resources cleaned up.");
    };

    // Add an event listener to clean up when the page is unloaded
    window.addEventListener("beforeunload", cleanup);

    return [];
};
