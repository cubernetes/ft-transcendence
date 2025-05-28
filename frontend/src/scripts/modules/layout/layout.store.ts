import { handlePopState, navigateTo } from "../../global/router";
import { createStore } from "../../global/store";
import { createStarfield } from "../../ui/layout/Background";
import { hydrateHeader } from "../../ui/layout/Header";
import { appendChildren, createEl } from "../../utils/dom-helper";

type LayoutState = {
    root: HTMLElement;
    header: HTMLElement;
    canvas: HTMLCanvasElement;
    router: HTMLDivElement;
    footer: HTMLElement;
    backgroundEl: HTMLCanvasElement;
    arcadeImg: HTMLImageElement;
    initialized: boolean;
};

// It's important to make these stateless because it's root, move states to subscriber
export const initLayoutState = {
    root: createEl("div"),
    header: createEl(
        "header",
        "w-full p-4 bg-gray-900/50 text-white flex justify-center items-center z-30",
        {
            attributes: { id: CONST.ID.HEADER },
        }
    ),
    canvas: createEl("canvas", "w-screen h-screen hidden z-20", {
        attributes: { id: CONST.ID.CANVAS },
    }),
    router: createEl("div", "flex-grow flex items-center justify-center w-full h-full z-20", {
        attributes: { id: CONST.ID.ROUTER },
    }),
    // Arcade image as an absolutely positioned overlay
    arcadeImg: createEl(
        "img",
        "absolute inset-0 mx-auto my-auto z-10 pointer-events-none select-none",
        {
            attributes: {
                src: "/assets/images/arcade.png",
                style: "max-width:100vw;max-height:100vh;left:0;right:0;top:0;bottom:0;",
            },
        }
    ),
    backgroundEl: createStarfield(document.body),
    footer: createEl("footer", "bg-gray-900/50 text-white p-4 text-center z-20", {
        attributes: { id: CONST.ID.FOOTER },
        children: [createEl("p", "", { text: "© 2025 ft-transcendence" })],
    }),
    initialized: false,
};

export const layoutStore = createStore<LayoutState>(initLayoutState);

// Entry point of the app
layoutStore.subscribe((state) => {
    const { root, header, canvas, router, footer, backgroundEl, arcadeImg } = state;

    if (!state.initialized) {
        state.initialized = true;

        appendChildren(root, [backgroundEl, arcadeImg, header, canvas, router, footer]);

        hydrateHeader(header);
        window.addEventListener("popstate", handlePopState);
        navigateTo(CONST.ROUTE.DEFAULT, true);
    }
});
