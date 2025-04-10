import { layoutStore } from "./layout.store";

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
