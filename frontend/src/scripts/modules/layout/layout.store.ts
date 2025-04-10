import { createRouter } from "../../global/router";
import { createStore } from "../../global/store";
import { createFooter } from "../../ui/layout/Footer";
import { createHeader } from "../../ui/layout/Header";
import { appendChildren, createEl } from "../../utils/dom-helper";

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
    const router = createEl("div", "", {
        attributes: { id: window.cfg.id.router },
    });
    const footer = createFooter();

    appendChildren(rootEl, [header, canvas, router, footer]);
    return { header, canvas, router, footer };
};

export const layoutStore = createStore<LayoutState>(emptyLayoutState);

layoutStore.subscribe(async (state) => {
    window.log.debug("LayoutStore subscriber triggered");

    // Safeguard, should never be triggered
    if (!state.router) {
        window.log.error("LayoutStore cannot find router container");
        return;
    }

    createRouter(state.router);
});

/** Hide header and footer */
export const hidePageElements = () => {
    window.log.debug("HidePageElements triggered");
    const { header, footer } = layoutStore.get();

    if (!header || !footer) {
        window.log.error("HidePageElements cannot find header or footer");
        return;
    }

    header.classList.add("hidden");
    footer.classList.add("hidden");
};

/** Show header and footer */
export const showPageElements = () => {
    window.log.debug("ShowPageElements triggered");
    const { header, footer } = layoutStore.get();

    if (!header || !footer) {
        window.log.error("HidePageElements cannot find header or footer");
        return;
    }

    header.classList.remove("hidden");
    footer.classList.remove("hidden");
};
