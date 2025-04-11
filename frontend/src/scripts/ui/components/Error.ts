import { createEl } from "../../utils/dom-helper";

/**
 * Create an error block.
 * @param tw optional additional tailwind classes,
 *           default "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4",
 *           extendable and replacable by this param adding to it
 * @returns {error, show, hide}
 */
export const createError = (tw: string = "") => {
    const baseTw = "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4";
    const fullTw = `${baseTw} ${tw}`;

    const error = createEl("div", fullTw);

    return {
        error,
        show: (msg: string) => {
            error.textContent = msg;
            error.classList.remove("hidden");
        },
        hide: () => {
            error.classList.add("hidden");
        },
    };
};
