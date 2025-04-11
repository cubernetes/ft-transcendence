import { createEl } from "../../utils/dom-helper";

/**
 * Create a button element.
 * @param text text content of the button
 * @param tw optional additional tailwind classes,
 *           default "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400",
 *           extendable: by simply adding to it
 *           replacable/override: by prefixing with "!"
 * @param click optional onclick event
 */
export const createButton = (
    text: string,
    tw: string = "",
    click?: () => void
): HTMLButtonElement => {
    const defaultTw = "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400";
    const fullTw = tw.startsWith("!") ? tw.slice(1) : `${defaultTw} ${tw}`;

    const button = createEl("button", fullTw, { text });

    if (click) {
        button.onclick = click;
    }

    return button;
};
