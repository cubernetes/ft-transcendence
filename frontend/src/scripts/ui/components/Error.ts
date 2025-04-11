import { createEl } from "../../utils/dom-helper";

/**
 * Create an error block.
 * @param tw optional additional tailwind classes,
 *           default "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4",
 *           extendable and replacable by this param adding to it
 */
export const createError = (
    tw: string = ""
): {
    errorDiv: HTMLElement;
    showErr: (msg: string) => void;
    hideErr: () => void;
} => {
    const baseTw = "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4";
    const fullTw = `${baseTw} ${tw}`;

    const errorDiv = createEl("div", fullTw);

    return {
        errorDiv,
        showErr: (msg: string) => {
            errorDiv.textContent = msg;
            errorDiv.classList.remove("hidden");
        },
        hideErr: () => {
            errorDiv.classList.add("hidden");
        },
    };
};
