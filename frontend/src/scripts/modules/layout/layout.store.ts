import { handlePopState, navigateTo } from "../../global/router";
import { createStore } from "../../global/store";
import { hydrateHeader } from "../../ui/layout/Header";
import { sendApiRequest } from "../../utils/api";
import { appendChildren, createEl } from "../../utils/dom-helper";
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
    root: createEl("div"), // Space holder, will be replaced by #app
    header: createEl("header", "bg-black/50 p-4 text-white justify-between items-center hidden", {
        attributes: { id: CONST.ID.HEADER },
    }),
    canvas: createEl("canvas", "w-screen h-screen hidden", {
        attributes: { id: CONST.ID.CANVAS },
    }),
    router: createEl("div", "flex-grow flex items-center justify-center w-full", {
        attributes: { id: CONST.ID.ROUTER },
    }),
    footer: createEl("footer", "bg-gray-200 p-4 text-center hidden", {
        attributes: { id: CONST.ID.FOOTER },
        children: [createEl("p", "", { text: "© 2025 ft-transcendence" })],
    }),
    initialized: false,
};

export const layoutStore = createStore<LayoutState>(initLayoutState);

// Entry point of the app
layoutStore.subscribe((state) => {
    const { root, header, canvas, router, footer } = state;

    if (!state.initialized) {
        state.initialized = true;

        // Attach elements to root
        appendChildren(root, [header, canvas, router, footer]);

        // Hydrate needed states for persisted elements
        hydrateHeader(header);

        // Attach pop state handler
        window.addEventListener("popstate", handlePopState);
        window.addEventListener("beforeunload", () => {
            gameStore.get().controller?.endGame();
        });

        // Navigate To default page
        // TODO: Should try to get the location.pathname, i.e quickplay
        navigateTo(CONST.ROUTE.DEFAULT, true);
    }
});
