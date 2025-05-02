import { TranslationKey, languageStore, texts } from "../../global/language";
import { createEl } from "../../utils/dom-helper";

/**
 * Create a heading text element.
 * @param text text string
 * @param tw optional additional tailwind classes,
 *           default "text-6xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 * @param tag HTMLElementTagName, default is h2
 */
export const createTitleText = (
    text: string,
    tw: string = "",
    tag: keyof HTMLElementTagNameMap = "h2"
): HTMLElement => {
    // h2 all or ?
    const baseTw = "text-6xl font-bold mb-4 text-center text-black";
    const fullTw = `${baseTw} ${tw}`;
    const title = createEl(tag, fullTw, { text });

    return title;
};

/**
 * Create a text element.
 * @param text text string
 * @param tw optional additional tailwind classes,
 *           default "text-6xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 */
export const createBodyText = (text: TranslationKey, tw: string = ""): HTMLElement => {
    const baseTw = "text-xl text-black";
    const fullTw = `${baseTw} ${tw}`;
    const bodyEl = createEl("p", fullTw, { text });

    const unsubscribeLang = languageStore.subscribe(
        ({ lang }) => (bodyEl.textContent = texts[lang][text])
    );

    bodyEl.addEventListener("destroy", unsubscribeLang);

    return bodyEl;
};
