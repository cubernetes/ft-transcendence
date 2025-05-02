import { TranslationKey, getText, languageStore } from "../../global/language";
import { createEl } from "../../utils/dom-helper";
import { createBodyText } from "./Text";

export const createError = (
    tw: string = ""
): {
    errorDiv: HTMLElement;
    showErr: (msgKey: TranslationKey) => void;
    hideErr: () => void;
    updateErr: () => void;
} => {
    const baseTw = "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4";
    const fullTw = `${baseTw} ${tw}`;

    const errorDiv = createEl("div", fullTw);
    let currentMsgKey: TranslationKey | null = null;

    const updateErr = () => {
        if (currentMsgKey) {
            errorDiv.textContent = getText(currentMsgKey);
        }
    };

    languageStore.subscribe(() => {
        updateErr();
    });

    return {
        errorDiv,
        showErr: (msgKey: TranslationKey) => {
            currentMsgKey = msgKey;
            updateErr();
            errorDiv.classList.remove("hidden");
        },
        hideErr: () => {
            currentMsgKey = null;
            errorDiv.classList.add("hidden");
        },
        updateErr,
    };
};

// When API fetching failed
export const createApiError = (ctn: HTMLElement, message: string): HTMLElement => {
    ctn.appendChild(createBodyText("failed_query", "text-red-500 text-lg"));
    return ctn;
};
