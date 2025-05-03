import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";

// Default tailwind style to be applied to all button elements, additional styles will be merged
const BASE_TW = "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400";
type ButtonOpts = { t: string; tw?: string; click?: () => void };

// TODO: Deprecating this, just need to ensure more everything translation related is set up ok
export const createButton = (text: string, tw = "", click?: () => void): HTMLButtonElement => {
    const twStyle = twMerge(BASE_TW, tw);
    const events = click ? { click } : undefined;

    const button = createEl("button", twStyle, { text, events });
    return button;
};

/**
 * Create a custom button element with native life cycle support. Params passed in as object.
 * @param t the translatable key for text content or literal string (no translation needed)
 * @param tw optional tailwind classes, overriding (merge) with default defined in component
 * @param click optional onclick event
 */
export const createButtonEl = ({ t, tw = "", click }: ButtonOpts) => {
    const text = isValidKey(t) ? getText(t) : t;
    const attributes = isValidKey(text) ? { [CONST.ATTR.I18N_TEXT]: text } : undefined;
    const twStyle = twMerge(BASE_TW, tw);
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
//         log.debug(`Button connected cb triggered`);
//         this.unsubscribeLang = languageStore.subscribe(() => {
//             const key = window.cfg.label.textKey;
//             this.textContent = getText(this.getAttribute(key) as TextKey);
//         });
//     }

//     disconnectedCallback() {
//         log.debug(`Button disconnected cb triggered`);
//         this.unsubscribeLang();
//     }
// }

// customElements.define("ft-button", FtButton, { extends: "button" });
