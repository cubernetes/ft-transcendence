import { createPongEngine } from "@darrenkuro/pong-core";
import { createRouter } from "../../global/router";
import { createStore } from "../../global/store";
import { createFooter } from "../../ui/layout/Footer";
import { createHeader } from "../../ui/layout/Header";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { authStore, initAuthState } from "../auth/auth.store";
import { createGameController } from "../game/game.controller";
import { createGameEventController } from "../game/game.event";
import { createRenderer } from "../game/game.renderer";
import { gameStore } from "../game/game.store";

type LayoutState = {
    root: HTMLElement;
    header: HTMLElement;
    canvas: HTMLCanvasElement;
    router: HTMLDivElement;
    footer: HTMLElement;
    initialized: boolean;
};

// It's important to make these stateless because it's root, move states to subscriber
export const initLayoutState = {
    root: createEl("div"),
    header: createEl(
        "header",
        "bg-black/50 p-4 text-white justify-between items-center font-medieval hidden",
        { attributes: { id: window.cfg.id.header } }
    ),
    canvas: createEl("canvas", "w-full h-full hidden", {
        attributes: { id: window.cfg.id.canvas },
    }),
    router: createEl("div", "flex-grow flex items-center justify-center w-full", {
        attributes: { id: window.cfg.id.router },
    }),
    footer: createEl("footer", "bg-gray-200 p-4 text-center font-medieval hidden", {
        attributes: { id: window.cfg.id.footer },
        children: [createEl("p", "", { text: "© 2025 ft-transcendence" })],
    }),
    initialized: false,
};

export const layoutStore = createStore<LayoutState>(initLayoutState);

layoutStore.subscribe((state) => {
    window.log.debug("LayoutStore subscriber triggered");

    const { root, header, canvas, router, footer } = state;

    if (!state.initialized) {
        state.initialized = true;

        // Attach elements to root
        appendChildren(root, [header, canvas, router, footer]);

        // Create neededstates for persisted elements
        createHeader(header);

        // Create router
        createRouter(router);

        // Initilize game renderer, controller, pong engine, and event controller
        createRenderer(canvas).then((renderer) => {
            const controller = createGameController(renderer);
            const pongEngine = createPongEngine();
            const eventController = createGameEventController(pongEngine);

            gameStore.update({ renderer, controller, pongEngine, eventController });

            initAuthState().then((initialState) => {
                authStore.set(initialState);
            });
        });
    }
});
