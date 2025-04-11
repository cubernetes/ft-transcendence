import { layoutStore } from "./layout.store";

/** Hide header and footer. */
export const hidePageElements = () => {
    const { header, footer } = layoutStore.get();
    header.classList.add("hidden");
    footer.classList.add("hidden");
};

/** Show header and footer. */
export const showPageElements = () => {
    const { header, footer } = layoutStore.get();
    header.classList.remove("hidden");
    footer.classList.remove("hidden");
};

/** Hide canvas. */
export const hideCanvas = () => {
    const { canvas } = layoutStore.get();
    canvas.classList.add("hidden");
};

/** Show canvas. */
export const showCanvas = () => {
    const { canvas } = layoutStore.get();
    canvas.classList.remove("hidden");
};

/** Hide router container. */
export const hideRouter = () => {
    const { router } = layoutStore.get();
    router.classList.add("hidden");
};

/** Show router container. */
export const showRouter = () => {
    const { router } = layoutStore.get();
    router.classList.remove("hidden");
};
