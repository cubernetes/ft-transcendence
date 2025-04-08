import { PongState, createPongEngine } from "@darrenkuro/pong-core";
import { createGameController } from "../../modules/game/game.controller";
import { createRenderer, disposeRenderer } from "../../modules/game/game.renderer";
// import { createRenderer } from "../../modules/game/game.renderer";
import { createEl } from "../../utils/dom-helper";
import { createFooter } from "../layout/Footer";
import { createHeader } from "../layout/Header";

export const createLocalGamePage = async (): Promise<HTMLElement[]> => {
    const header = await createHeader();
    const footer = createFooter();

    const canvas = createEl("canvas", "w-full h-full", { attributes: { id: "renderCanvas" } });
    const container = createEl("div", "w-full h-[600px] relative", { children: [canvas] });

    const renderer = await createRenderer(canvas);
    const controller = createGameController(renderer);
    const engine = createPongEngine();

    const handleKeydown = (event: KeyboardEvent) => {
        window.log.debug(`Key pressed: ${event.key}`);
        if (event.key === "w") {
            engine.setInput(0, "up");
        } else if (event.key === "s") {
            engine.setInput(0, "down");
        } else if (event.key === "ArrowUp") {
            engine.setInput(1, "up");
        } else if (event.key === "ArrowDown") {
            engine.setInput(1, "down");
        }
    };

    document.addEventListener("keydown", handleKeydown);

    const handleKeyup = (event: KeyboardEvent) => {
        window.log.debug(`Key released: ${event.key}`);
        if (["w", "s"].includes(event.key)) {
            engine.setInput(0, "stop");
        } else if (["ArrowUp", "ArrowDown"].includes(event.key)) {
            engine.setInput(1, "stop");
        }
    };

    document.addEventListener("keyup", handleKeyup);

    const setupEventListeners = () => {
        engine.onEvent("wall-collision", () => controller.handleWallCollision());
        engine.onEvent("paddle-collision", () => controller.handlePaddleCollision());
        engine.onEvent("score", (evt) => controller.updateScores(evt.scores));
        engine.onEvent("state-update", (evt) => {
            controller.updateBall(evt.state.ball);
            controller.updateLeftPaddle(evt.state.paddles[0].pos);
            controller.updateRightPaddle(evt.state.paddles[1].pos);
        });
    };

    setupEventListeners();
    const result = engine.start();
    if (result.isOk()) {
        window.log.info("Pong engine ok!");
    }

    // Destroy and clean up
    container.addEventListener("destroy", () => {
        document.removeEventListener("keyup", handleKeyup);
        document.removeEventListener("keydown", handleKeydown);
        window.log.info("keyup and keydown event listeners removed");

        disposeRenderer(renderer);
        //GameInstance.destroyInstance(); // This doesn't clean, music still playing?
    });

    // For game, maybe don't include header/footer?
    renderer.runRenderLoop(() => {
        renderer.scene.render();
    });

    // Destory this properly
    window.addEventListener("resize", () => renderer.resize());
    // Initial scale
    requestAnimationFrame(() => renderer.resize());

    return [header, container, footer];
};
