import { createRouter } from "../../global/router";
import { createStore } from "../../global/store";
import { createFooter } from "../../ui/layout/Footer";
import { createHeader } from "../../ui/layout/Header";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createGameController } from "../game/game.controller";
import { createRenderer } from "../game/game.renderer";
import { gameStore } from "../game/game.store";

type LayoutState = {
    header: HTMLElement | null;
    canvas: HTMLCanvasElement | null;
    router: HTMLDivElement | null;
    footer: HTMLElement | null;
};

export const emptyLayoutState = {
    header: null,
    canvas: null,
    router: null,
    footer: null,
};

export const initLayoutState = async (rootEl: HTMLElement): Promise<LayoutState> => {
    const header = await createHeader();
    const canvas = createEl("canvas", "w-full h-full hidden", {
        attributes: { id: window.cfg.id.canvas },
    });
    const router = createEl("div", "flex-grow flex items-center justify-center w-full", {
        attributes: { id: window.cfg.id.router },
    });
    const footer = createFooter();

    appendChildren(rootEl, [header, canvas, router, footer]);
    return { header, canvas, router, footer };
};

export const layoutStore = createStore<LayoutState>(emptyLayoutState);

layoutStore.subscribe(async (state) => {
    window.log.debug("LayoutStore subscriber triggered");

    const { router, canvas } = state;
    // Safeguard, should never be triggered
    if (!router || !canvas) {
        window.log.error("LayoutStore cannot find router or canvas container");
        return;
    }

    createRouter(router);
    const renderer = await createRenderer(canvas);
    const controller = createGameController(renderer);
    gameStore.update({ controller });
});
