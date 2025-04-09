import { PongState, createPongEngine, defaultGameConfig } from "@darrenkuro/pong-core";
import { createGameController } from "../../modules/game/game.controller";
import { createRenderer, disposeRenderer } from "../../modules/game/game.renderer";
import { defaultGameState, gameStore } from "../../modules/game/game.store";
import { sendDirection, sendGameStart } from "../../modules/ws/ws.service";
import { createEl } from "../../utils/dom-helper";
import { createFooter } from "../layout/Footer";
import { createHeader } from "../layout/Header";

export const createRemoteGamePage = async (): Promise<HTMLElement[]> => {
    const header = await createHeader();
    const footer = createFooter();

    const canvas = createEl("canvas", "w-full h-full", { attributes: { id: "renderCanvas" } });
    const container = createEl("div", "w-full h-[600px] relative", { children: [canvas] });

    const renderer = await createRenderer(canvas);
    const controller = createGameController(renderer);
    gameStore.update({ renderer, controller });

    const handleKeydown = (evt: KeyboardEvent) => {
        window.log.debug(`Key pressed: ${evt.key}`);
        if (evt.key === "w" || evt.key === "ArrowUp") {
            sendDirection("up");
        } else if (evt.key === "s" || evt.key === "ArrowDown") {
            sendDirection("down");
        }
    };

    document.addEventListener("keydown", handleKeydown);

    const handleKeyup = (evt: KeyboardEvent) => {
        window.log.debug(`Key released: ${evt.key}`);
        if (["w", "s", "ArrowUp", "ArrowDown"].includes(evt.key)) {
            sendDirection("stop");
        }
    };

    document.addEventListener("keyup", handleKeyup);

    sendGameStart();

    // Destroy and clean up
    container.addEventListener("destroy", () => {
        document.removeEventListener("keyup", handleKeyup);
        document.removeEventListener("keydown", handleKeydown);
        window.log.info("keyup and keydown event listeners removed");

        disposeRenderer(renderer);
    });

    renderer.runRenderLoop(() => {
        renderer.scene.render();
    });

    // Destory this properly
    window.addEventListener("resize", () => renderer.resize());
    // Initial scale
    requestAnimationFrame(() => renderer.resize());

    return [header, container, footer];
};
