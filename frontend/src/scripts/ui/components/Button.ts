import { createEl } from "../../utils/dom-helper";

/**
 * Create a button element.
 * @param text text content of the button
 * @param tw optional additional tailwind classes,
 *           default "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400",
 *           extendable and replacable by this param adding to it
 * @param click optional onclick event
 */
export const createButton = (
    text: string,
    tw: string = "",
    click?: () => void
): HTMLButtonElement => {
    const baseTw = "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400";
    const fullTw = `${baseTw} ${tw}`;

    const button = createEl("button", fullTw, { text });

    if (click) {
        button.onclick = click;
    }

    return button;
};
