import { twMerge } from "tailwind-merge";
import { I18nKey } from "../../modules/locale/locale.en";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
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
 * @param t the translatable key for text content or literal string (no translation needed)
 * @param tw optional tailwind classes, overriding (merge) with default defined in config
 * @param click optional onclick event
 */
export const createBtnEl = (text: string, tw = "", click?: () => void) => {
    text = isValidKey(text) ? getText(text) : text;
    const attributes = isValidKey(text) ? { [window.cfg.label.textKey]: text } : undefined;

    const twStyle = twMerge(window.cfg.TW.BTN, tw);
    const events = click ? { click } : undefined;

    const button = createEl("button", twStyle, { text, attributes, events });

    return button;
};

// export class FtButton extends HTMLButtonElement {
//     private unsubscribeLang!: () => void;

//     constructor() {
//         super();
//     }

//     connectedCallback() {
//         window.log.debug(`Button connected cb triggered`);
//         this.unsubscribeLang = languageStore.subscribe(() => {
//             const key = window.cfg.label.textKey;
//             this.textContent = getText(this.getAttribute(key) as TextKey);
//         });
//     }

//     disconnectedCallback() {
//         window.log.debug(`Button disconnected cb triggered`);
//         this.unsubscribeLang();
//     }
// }

// customElements.define("ft-button", FtButton, { extends: "button" });
