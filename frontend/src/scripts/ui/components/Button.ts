import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";

// Structure of the options to be passed in, esay to extend
type Opts = {
    text?: string;
    i18nVars?: Record<string, string | number>;
    tw?: string;
    click?: () => void;
    type?: "submit" | "reset";
    innerHTML?: string; // For return button
};

/**
 * Create a custom button element with native life cycle support. Params passed in as object.
 * @param text the translatable key for text content or literal string (no translation needed)
 * @param tw optional tailwind classes, overriding (merge) with default defined in component
 * @param click optional onclick event
 */
export const createButton = ({
    text = "",
    i18nVars,
    tw = "",
    click,
    type,
    innerHTML,
}: Opts): HTMLButtonElement => {
    // Default tailwind style to be applied to all button elements, additional styles will be merged
    const BASE_TW = "rounded text-center";
    // bg-gray-100 hover:bg-gray-400
    // maybe select-none? dones't seem to be needed, disabled:opacity-50 font-medium transition
    // inline-block

    const twStyle = twMerge(BASE_TW, tw);
    const props = type ? { type } : undefined;
    const events = click ? { click } : undefined;

    const button = createEl("button", twStyle, { text, i18nVars, props, events });

    if (innerHTML) button.innerHTML = innerHTML;

    return button;
};

export const createCopyButton = (text: string, tw = ""): HTMLButtonElement => {
    const { COPY, COPIED } = CONST.TEXT;

    const copyBtn = createButton({
        text: COPY,
        tw: twMerge("ml-4 px-3 py-1 rounded hover:bg-blue-300 transition-all", tw),
        click: () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = getText(COPIED);
                copyBtn.setAttribute(CONST.ATTR.I18N_TEXT, COPIED);
                setTimeout(() => {
                    copyBtn.textContent = getText(COPY);
                    copyBtn.setAttribute(CONST.ATTR.I18N_TEXT, COPY);
                }, 2000);
            });
        },
    });

    return copyBtn;
};

// TODO: Deprecating this, just need to ensure more everything translation related is set up ok
// export const createButton = (text: string, tw = "", click?: () => void): HTMLButtonElement => {
//     const twStyle = twMerge(BASE_TW, tw);
//     const events = click ? { click } : undefined;

//     const button = createEl("button", twStyle, { text, events });
//     return button;
// };

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
