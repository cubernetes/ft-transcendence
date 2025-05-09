import { twMerge } from "tailwind-merge";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "./Button";

type Opts = {
    texts: string[];
    twSelected?: string;
    cbs?: (() => void)[];
    twBtnSpecific?: string[];
    twBtn?: string;
    twCtn?: string;
    defaultSelected?: number;
};

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
export const createButtonGroup = ({
    texts,
    twSelected = "",
    cbs,
    twBtn = "",
    twBtnSpecific,
    twCtn = "",
    defaultSelected,
}: Opts): HTMLDivElement => {
    const BASE_CTN_TW = "flex";
    const ctnTwStyle = twMerge(BASE_CTN_TW, twCtn);
    const container = createEl("div", ctnTwStyle); // use container

    const setActive = (btn: HTMLButtonElement) => {
        const twSelectedList = twSelected.split(" ").filter(Boolean);
        Array.from(container.children).forEach((el) => {
            twSelectedList.forEach((tw) => el.classList.remove(tw));
            el.classList.remove(CONST.CLASS.ACTIVE_BTN);
        });

        twSelectedList.forEach((tw) => btn.classList.add(tw));
        btn.classList.add(CONST.CLASS.ACTIVE_BTN);
    };

    texts.forEach((text, i) => {
        const click = () => {
            if (twSelected) setActive(btn); // Default
            cbs?.[i]?.();
        };
        const tw = twMerge(twBtn, twBtnSpecific?.[i]);
        const btn = createButton({ text, tw, click });

        if (defaultSelected === i) {
            setActive(btn);
        }

        container.appendChild(btn);
    });

    return container;
};
