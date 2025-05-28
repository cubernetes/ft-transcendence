import { twMerge } from "tailwind-merge";
import { isValidKey } from "../../modules/locale/locale.utils";
import { getText } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";
import { createParagraph } from "./Paragraph";

type Opts = { tw?: string; id?: string };

type StatusComponent = {
    statusEl: HTMLElement;
    showErr: (msg: string) => void;
    showOk: (msg: string) => void;
    hideStatus: () => void;
};

export const createStatus = ({ tw = "", id }: Opts = {}): StatusComponent => {
    const BASE_TW = `hidden p-2 rounded ${CONST.FONT.BODY_XXS} mt-4`;
    const ERR_TW = "bg-red-100 text-red-500";
    const OK_TW = "bg-green-100 text-green-500";

    const twStyle = twMerge(BASE_TW, tw);
    const attributes = id ? { id } : undefined;

    const statusEl = createEl("p", twStyle, { attributes });

    return {
        statusEl,
        showErr: (msg: string) => {
            if (isValidKey(msg)) {
                statusEl.textContent = getText(msg);
                statusEl.setAttribute(CONST.ATTR.I18N_TEXT, msg);
            } else {
                statusEl.textContent = msg;
            }
            statusEl.className = twMerge(twStyle, ERR_TW);
            statusEl.classList.remove("hidden");
        },
        showOk: (msg: string) => {
            if (isValidKey(msg)) {
                statusEl.textContent = getText(msg);
                statusEl.setAttribute(CONST.ATTR.I18N_TEXT, msg);
            } else {
                statusEl.textContent = msg;
            }
            statusEl.className = twMerge(twStyle, OK_TW);
            statusEl.classList.remove("hidden");
        },
        hideStatus: () => {
            statusEl.removeAttribute(CONST.ATTR.I18N_TEXT);
            statusEl.classList.add("hidden");
        },
    };
};

// When API fetching failed
export const createApiError = (ctn: HTMLElement, message: string): HTMLElement => {
    ctn.appendChild(createParagraph({ text: "failed_query", tw: "text-red-500 text-lg" }));
    return ctn;
};
