import { TranslationKey, getText, languageStore } from "../../global/language";
import { createEl } from "../../utils/dom-helper";

export const createError = (
    tw: string = ""
): {
    errorDiv: HTMLElement;
    showErr: (msgKey: TranslationKey) => void;
    hideErr: () => void;
} => {
    const baseTw = "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4";
    const fullTw = `${baseTw} ${tw}`;

    const errorDiv = createEl("div", fullTw);

    languageStore.subscribe(() => {
        errorDiv.textContent = getText(errorDiv.dataset.msgKey as TranslationKey);
    });

    return {
        errorDiv,
        showErr: (msgKey: TranslationKey) => {
            errorDiv.dataset.msgKey = msgKey;
            errorDiv.textContent = getText(msgKey);
            errorDiv.classList.remove("hidden");
        },
        hideErr: () => {
            errorDiv.classList.add("hidden");
        },
    };
};
