import { Engine } from "@babylonjs/core";
import { createRouter } from "../../global/router";
import { createStore } from "../../global/store";
import { createFooter } from "../../ui/layout/Footer";
import { createHeader } from "../../ui/layout/Header";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createGameController } from "../game/game.controller";
import { createRenderer } from "../game/game.renderer";

type DomState = {
    header: HTMLElement | null;
    canvas: HTMLCanvasElement | null;
    router: HTMLDivElement | null;
    footer: HTMLElement | null;
    renderer: Engine | null;
    controller: ReturnType<typeof createGameController> | null;
};

export const emptyDomState = {
    header: null,
    canvas: null,
    router: null,
    footer: null,
    renderer: null,
    controller: null,
};

export const initDomState = async (rootEl: HTMLElement): Promise<DomState> => {
    const header = await createHeader();
    const canvas = createEl("canvas", "w-full h-full hidden", {
        attributes: { id: window.cfg.id.canvas },
    });
    const router = createEl("div", "", {
        attributes: { id: window.cfg.id.router },
    });
    const footer = createFooter();
    const renderer = await createRenderer(canvas);
    const controller = createGameController(renderer);

    appendChildren(rootEl, [header, canvas, router, footer]);
    return { header, canvas, router, footer, renderer, controller };
};

export const domStore = createStore<DomState>(emptyDomState);

// Basically saying it's ready
domStore.subscribe(async (state) => {
    window.log.debug("DomStore subscriber trigged");
    if (!state.router) {
        return;
    }

    createRouter(state.router);
});
