import { twMerge } from "tailwind-merge";
import { TextKey, getText, languageStore } from "../../global/language";
import { createEl } from "../../utils/dom-helper";

// TODO: Deprecating this, just need to ensure more everything translation related is set up ok
export const createButton = (text: string, tw = "", click?: () => void): HTMLButtonElement => {
    const twStyle = twMerge(window.cfg.TW.BTN, tw);
    const events = click ? { click } : undefined;

    const button = createEl("button", twStyle, { text, events });
    return button;
};

/**
 * Create a custom button element with native life cycle support.
 * @param key the translatable key for text content
 * @param tw optional tailwind classes, overriding (merge) with default defined in config
 * @param click optional onclick event
 */
export const createBtnEl = (key: TextKey, tw = "", click?: () => void) => {
    const text = getText(key);
    const twStyle = twMerge(window.cfg.TW.BTN, tw);
    const attributes = { [window.cfg.label.textKey]: key };
    const events = click ? { click } : undefined;

    const button = createEl("ft-button", twStyle, { text, attributes, events });

    // const unsubscribeLang = languageStore.subscribe(() => (btnEl.textContent = getText(key)));
    // btnEl.addEventListener("destroy", unsubscribeLang);

    return button;
};

export class FtButton extends HTMLButtonElement {
    private unsubscribeLang!: () => void;

    constructor() {
        super();
    }

    connectedCallback() {
        window.log.debug(`Button connected cb triggered`);
        this.unsubscribeLang = languageStore.subscribe(() => {
            const key = window.cfg.label.textKey;
            this.textContent = getText(this.getAttribute(key) as TextKey);
        });
    }

    disconnectedCallback() {
        window.log.debug(`Button disconnected cb triggered`);
        this.unsubscribeLang();
    }
}

customElements.define("ft-button", FtButton, { extends: "button" });
