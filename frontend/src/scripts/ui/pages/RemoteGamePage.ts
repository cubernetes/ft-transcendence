import { createPongEngine } from "@darrenkuro/pong-core";
import { createEl } from "../../../utils/dom-helper";
import { logger } from "../../../utils/logger";
import { createFooter } from "../../layout/Footer";
import { createHeader } from "../../layout/Header";
import { GameInstance } from "./renderer/game.instance";

/**
 * Remote vs local vs "ai".
 */
export const createRemoteGamePage = async (
    mode: "remote" | "local" | "ai"
): Promise<HTMLElement[]> => {
    const header = await createHeader();
    const footer = createFooter();

    const canvas = createEl("canvas", "w-full h-full", { attributes: { id: "renderCanvas" } });
    const container = createEl("div", "w-full h-[600px] relative", { children: [canvas] });

    const gameInstance = await GameInstance.getInstance(canvas);
    if (!gameInstance) {
        logger.error("Couldn't find game instance");
    }

    if (mode === "remote") {
        // socket, send game start
        document.addEventListener("keydown", (event) => {
            logger.info(`Key pressed: ${event.key}`);
            if (event.key === "ArrowUp" || event.key === "w") {
                gameInstance.getWebSocketManager().sendDirection("up");
            } else if (event.key === "ArrowDown" || event.key === "s") {
                gameInstance.getWebSocketManager().sendDirection("down");
            }
        });

        document.addEventListener("keyup", (event) => {
            logger.info(`Key released: ${event.key}`);
            if (["ArrowUp", "ArrowDown", "w", "s"].includes(event.key)) {
                gameInstance.getWebSocketManager().sendDirection("stop");
            }
        });
    }

    if (mode === "local" || "ai") {
        const engine = createPongEngine();
        engine.start();
        engine.onEvent("wall-collision", () => {});
    }

    // Destroy and clean up

    // For game, maybe don't include header/footer?
    return [header, container, footer];
};
