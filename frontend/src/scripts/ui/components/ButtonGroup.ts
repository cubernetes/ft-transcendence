import { createEl } from "../../utils/dom-helper";
import { createButton } from "./Button";

/**
 * General a container with an array of buttons with uniform css style
 * Active button will be labeled as label.activeBtn
 */
export const createButtonGroup = (
    texts: string[],
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

    texts.forEach((text) => {
        const btn = createButton(text, twBtn);
        btn.onclick = () => setActive(btn);
        container.appendChild(btn);
    });

    return container;
};
