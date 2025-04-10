import { createEl } from "../../utils/dom-helper";

/**
 * @default h2
 * @default tw "text-6xl font-bold mb-4 text-center text-black"
 */
export const createTitleText = (text: string, tw = "", tag = "h2"): HTMLElement => {
    // h2 all or ?
    const baseTw = "text-6xl font-bold mb-4 text-center text-black";
    const fullTw = `${baseTw} ${tw}`;
    const title = createEl(tag, fullTw, { text });

    return title;
};

/**
 *
 * @default tw "text-xl text-black"
 */
export const createBodyText = (text: string, tw: string = ""): HTMLElement => {
    const baseTw = "text-xl text-black";
    const fullTw = `${baseTw} ${tw}`;
    const title = createEl("p", fullTw, { text });

    return title;
};
