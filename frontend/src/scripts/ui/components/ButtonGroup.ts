import { TranslationKey, getText, languageStore } from "../../global/language";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "./Button";

/**
 * Create a group of buttons with uniform css style.
 * Active button will be labeled as label.activeBtn, unless event explicited set by callbacks.
 * @param keys array of TranslationKeys for button texts
 * @param cbs array for on click event, mapped with index
 * @param twBtn optional additional tailwind classes for buttons,
 *              default "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400",
 *              extendable and replacable by this param adding to it
 * @param twCtn optional additional tailwind classes for button group container,
 *              default "flex space-x-4 mt-2",
 *              extendable and replacable by this param adding to it
 * @param twSelected optional tailwind classes
 */
export const createButtonGroup = (
    keys: TranslationKey[],
    cbs: (() => void)[],
    twBtn: string = "",
    twCtn: string = "",
    twSelected: string = "bg-gray-400"
): HTMLDivElement => {
    const baseCtnTailwind = "flex space-x-4 mt-2";
    const ctnTailwind = `${baseCtnTailwind} ${twCtn}`;
    const container = createEl("div", ctnTailwind);

    const buttons: HTMLButtonElement[] = [];

    const setActive = (btn: HTMLButtonElement) => {
        Array.from(container.children).forEach((el) => {
            el.classList.remove(twSelected);
            el.classList.remove(window.cfg.label.activeBtn);
        });

        btn.classList.add(twSelected);
        btn.classList.add(window.cfg.label.activeBtn);
    };

    keys.forEach((key, i) => {
        const btn = createButton(getText(key), twBtn);
        container.appendChild(btn);
        buttons.push(btn);
        btn.onclick = () => setActive(btn);

        // Attach callbacks, based on the index mapping
        if (cbs && cbs[i]) {
            btn.onclick = cbs[i];
        }
    });

    // Subscribe to language changes and update button texts dynamically
    const unsubscribe = languageStore.subscribe(() => {
        keys.forEach((key, i) => {
            // console.warn(`Button ${i} text updated to: ${buttons[i].textContent}`);
            buttons[i].textContent = getText(key);
        });
    });

    // Add a "destroy" event listener to clean up the subscription
    container.addEventListener("destroy", () => {
        window.log.debug("Unsubscribing from languageStore for ButtonGroup");
        unsubscribe(); // Unsubscribe from languageStore
    });

    if (!keys || keys.some((key) => key === undefined || key === null)) {
        console.error("Invalid keys array passed to createButtonGroup:", keys);
        return container;
    }

    return container;
};
