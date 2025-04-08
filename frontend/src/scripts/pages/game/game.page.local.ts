import { PongState, createPongEngine } from "@darrenkuro/pong-core";
import { createFooter } from "../../components/components.footer";
import { createHeader } from "../../components/components.header";
import { createEl } from "../../utils/dom.helper";
import { logger } from "../../utils/logger";
import { GameInstance } from "./renderer/game.instance";

export const createLocalGamePage = async (): Promise<HTMLElement[]> => {
    const header = await createHeader();
    const footer = createFooter();

    const canvas = createEl("canvas", "w-full h-full", { attributes: { id: "renderCanvas" } });
    const container = createEl("div", "w-full h-[600px] relative", { children: [canvas] });

    const gameInstance = await GameInstance.getInstance(canvas);
    if (!gameInstance) {
        logger.error("Couldn't find game instance");
    }

    const engine = createPongEngine();

    const handleKeydown = (event: KeyboardEvent) => {
        logger.debug(`Key pressed: ${event.key}`);
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
        logger.debug(`Key released: ${event.key}`);
        if (["w", "s"].includes(event.key)) {
            engine.setInput(0, "stop");
        } else if (["ArrowUp", "ArrowDown"].includes(event.key)) {
            engine.setInput(1, "stop");
        }
    };

    document.addEventListener("keyup", handleKeyup);

    const setupEventListeners = () => {
        engine.onEvent("wall-collision", async () => {
            const instance = await GameInstance.getInstance(
                document.getElementById("renderCanvas") as HTMLCanvasElement
            );
            instance.handleWallCollision();
        });
        engine.onEvent("paddle-collision", async () => {
            const instance = await GameInstance.getInstance(
                document.getElementById("renderCanvas") as HTMLCanvasElement
            );
            instance.handlePaddleCollision();
        });
        engine.onEvent("score", async () => {
            const instance = await GameInstance.getInstance(
                document.getElementById("renderCanvas") as HTMLCanvasElement
            );
            instance.handleScore();
        });
        engine.onEvent("state-update", async (evt: { state: PongState }) => {
            logger.info("state update!");
            const instance = await GameInstance.getInstance(
                document.getElementById("renderCanvas") as HTMLCanvasElement
            );
            const b = evt.state.ball.pos;
            instance.updateBallPosition(b.x, b.y, b.z);
            const p1 = evt.state.paddles[0].pos;
            instance.updateLeftPaddlePosition(p1.x, p1.y, p1.z);
            const p2 = evt.state.paddles[1].pos;
            instance.updateRightPaddlePosition(p2.x, p2.y, p2.z);
        });
    };

    setupEventListeners();
    const result = engine.start();
    if (result.isOk()) {
        logger.info("engine ok!");
    }

    // Destroy and clean up
    container.addEventListener("destroy", () => {
        document.removeEventListener("keyup", handleKeyup);
        document.removeEventListener("keydown", handleKeydown);
        logger.info("keyup and keydown event listeners removed");

        GameInstance.destroyInstance(); // This doesn't clean, music still playing?
    });

    // For game, maybe don't include header/footer?
    return [header, container, footer];
};
