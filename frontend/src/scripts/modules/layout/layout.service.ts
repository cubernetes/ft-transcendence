import { layoutStore } from "./layout.store";

/** Hide header and footer */
export const hidePageElements = () => {
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
    const { header, footer } = layoutStore.get();

    if (!header || !footer) {
        window.log.error("HidePageElements cannot find header or footer");
        return;
    }

    header.classList.remove("hidden");
    footer.classList.remove("hidden");
};

/** Hide canvas */
export const hideCanvas = () => {
    const { canvas } = layoutStore.get();

    if (!canvas) {
        window.log.error("HideCanvas cannot find canvas");
        return;
    }

    canvas.classList.add("hidden");
};

/** Show canvas*/
export const showCanvas = () => {
    const { canvas } = layoutStore.get();

    if (!canvas) {
        window.log.error("ShowCanvas cannot find canvas");
        return;
    }

    canvas.classList.remove("hidden");
};
