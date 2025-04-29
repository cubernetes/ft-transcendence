import { TranslationKey, getText, languageStore } from "../../global/language";
import { createEl } from "../../utils/dom-helper";

/**
 * Create a heading text element with dynamic translation updates.
 * @param key TranslationKey for the text
 * @param tw optional additional tailwind classes,
 *           default "text-6xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 * @param tag HTMLElementTagName, default is "h2"
 */
export const createTitleText = (
    key: TranslationKey,
    tw: string = "",
    tag: keyof HTMLElementTagNameMap = "h2"
): HTMLElement => {
    // h2 all or ?
    const baseTw = "text-6xl font-bold mb-4 text-center text-black";
    const fullTw = `${baseTw} ${tw}`;
    const title = createEl(tag, fullTw, {
        text: getText(key),
        attributes: { "data-translation-key": key },
    });

    // Subscribe to language changes and update the text dynamically
    const unsubscribe = languageStore.subscribe(() => {
        title.textContent = getText(key);
    });

    title.addEventListener("destroy", () => {
        window.log.debug(`Unsubscribing from languageStore for key: ${key}`);
        unsubscribe(); // Unsubscribe from languageStore
    });

    return title;
};

/**
 * Create a text element with dynamic translation updates.
 * @param key TranslationKey for the text
 * @param tw optional additional tailwind classes,
 *           default "text-6xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 */
export const createBodyText = (key: TranslationKey, tw: string = ""): HTMLElement => {
    const baseTw = "text-xl text-black";
    const fullTw = `${baseTw} ${tw}`;
    const bodyText = createEl("p", fullTw, {
        text: getText(key),
        attributes: { "data-translation-key": key }, // Add translation key as an attribute
    });

    // Subscribe to language changes and update the text dynamically
    const unsubscribe = languageStore.subscribe(() => {
        bodyText.textContent = getText(key);
    });

    bodyText.addEventListener("destroy", () => {
        window.log.debug(`Unsubscribing from languageStore for key: ${key}`);
        unsubscribe(); // Unsubscribe from languageStore
    });

    return bodyText;
};
