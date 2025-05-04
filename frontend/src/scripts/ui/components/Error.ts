import { twMerge } from "tailwind-merge";
import { I18nKey } from "../../modules/locale/locale.en";
import { isValidKey } from "../../modules/locale/locale.store";
import { getText } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";
import { createParagraph } from "./Paragraph";

type Opts = { tw?: string; id?: string };

type ErrorComponent = { errorEl: HTMLElement; showErr: (msg: string) => void; hideErr: () => void };

export const createError = ({ tw = "", id }: Opts): ErrorComponent => {
    const BASE_TW = "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4";
    const twStyle = twMerge(BASE_TW, tw);
    const attributes = id ? { id } : undefined;

    const errorEl = createEl("p", twStyle, { attributes });

    return {
        errorEl,
        showErr: (msg: string) => {
            if (isValidKey(msg)) {
                errorEl.textContent = getText(msg);
                errorEl.setAttribute(CONST.ATTR.I18N_TEXT, msg);
            } else {
                errorEl.textContent = msg;
            }
            errorEl.classList.remove("hidden");
        },
        hideErr: () => {
            errorEl.removeAttribute(CONST.ATTR.I18N_TEXT);
            errorEl.classList.add("hidden");
        },
    };
};

// When API fetching failed
export const createApiError = (ctn: HTMLElement, message: string): HTMLElement => {
    ctn.appendChild(createParagraph({ text: "failed_query", tw: "text-red-500 text-lg" }));
    return ctn;
};
