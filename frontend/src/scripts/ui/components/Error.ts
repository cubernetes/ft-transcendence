import { I18nKey } from "../../modules/locale/locale.en";
import { getText } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";
import { createBodyText } from "./Text";

export const createError = (
    tw: string = ""
): {
    errorDiv: HTMLElement;
    showErr: (msg: I18nKey) => void;
    hideErr: () => void;
} => {
    const baseTw = "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4";
    const fullTw = `${baseTw} ${tw}`;

    const errorDiv = createEl("div", fullTw);

    return {
        errorDiv,
        showErr: (msg: I18nKey) => {
            errorDiv.textContent = getText(msg);
            errorDiv.setAttribute(CONST.ATTR.I18N_TEXT, msg);
            errorDiv.classList.remove("hidden");
        },
        hideErr: () => {
            errorDiv.removeAttribute(CONST.ATTR.I18N_TEXT);
            errorDiv.classList.add("hidden");
        },
    };
};

// When API fetching failed
export const createApiError = (ctn: HTMLElement, message: string): HTMLElement => {
    ctn.appendChild(createBodyText("failed_query", "text-red-500 text-lg"));
    return ctn;
};
