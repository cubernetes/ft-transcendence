import { twMerge } from "tailwind-merge";
import { createEl } from "../../utils/dom-helper";
import { appendChildren } from "../../utils/dom-helper";

// Wrapper for router elements to fit into the arcade layout
export const createArcadeWrapper = (container: UIComponent): UIComponent => {
    const BASE_TW =
        "absolute left-[33%] top-[22%] w-[34%] h-1/2 flex items-center justify-center z-20 pointer-events-auto";

    const wrapper = createEl("div", BASE_TW);
    appendChildren(wrapper, container);

    return [wrapper];
};
