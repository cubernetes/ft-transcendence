import { createButton } from "./Button";

/**
 * Create a return button.
 * @param src container element to be replaced by
 * @param target the new element to be put in place of ctn
 * @param tw optional tailwind css classes,
 *           default "absolute top-8 left-8 p-2 bg-gray-400 text-black hover:bg-gray-600",
 *           extendable and replacable by this param adding to it
 */
export const createReturnButton = (src: HTMLElement, target: HTMLElement, tw = "") => {
    const baseTw = "absolute top-8 left-8 p-2 bg-gray-400 text-black hover:bg-gray-600";
    const fullTw = `${baseTw} ${tw}`;

    const returnBtn = createButton("", fullTw, () => src.replaceWith(target));
    returnBtn.innerHTML = "&#8617;";
    return returnBtn;
};
