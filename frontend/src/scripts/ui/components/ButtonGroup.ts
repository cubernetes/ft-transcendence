import { createEl } from "../../utils/dom-helper";
import { createButton } from "./Button";

/**
 * General a container with an array of buttons with uniform css style
 * Active button will be labeled as label.activeBtn
 * @default twCtn "flex space-x-4 mt-2"
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
            el.classList.remove(window.cfg.label.activeBtn);
        });

        btn.classList.add(twSelected);
        btn.classList.add(window.cfg.label.activeBtn);
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
