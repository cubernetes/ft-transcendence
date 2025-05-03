import { createEl } from "../../utils/dom-helper";
import { createButton } from "./Button";

/**
 * Create a group of buttons with uniform css style.
 * Active button will be labeled as label.activeBtn, unless event explicited set by callbacks.
 * @param texts array for text contents of the buttons
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
    texts: string[],
    cbs: (() => void)[],
    twBtn: string = "",
    twCtn: string = "",
    twSelected: string = "bg-gray-400"
): HTMLDivElement => {
    const baseCtnTailwind = "flex space-x-4 mt-2";
    const ctnTailwind = `${baseCtnTailwind} ${twCtn}`;
    const container = createEl("div", ctnTailwind);

    const setActive = (btn: HTMLButtonElement) => {
        Array.from(container.children).forEach((el) => {
            el.classList.remove(twSelected);
            el.classList.remove(CONST.CLASS.ACTIVE_BTN);
        });

        btn.classList.add(twSelected);
        btn.classList.add(CONST.CLASS.ACTIVE_BTN);
    };

    texts.forEach((text, i) => {
        const btn = createButton(text, twBtn);
        container.appendChild(btn);

        // Default onclick
        btn.onclick = () => setActive(btn);

        // Attach callbacks, based on the index mapping
        if (cbs && cbs[i]) {
            btn.onclick = cbs[i];
        }
    });

    return container;
};
