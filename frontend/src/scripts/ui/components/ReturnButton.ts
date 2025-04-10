import { createButton } from "./Button";

/**
 * Create a return button.
 * @param src container element to be replaced by
 * @param target the new element to be put in place of ctn
 */
export const createReturnButton = (src: HTMLElement, target: HTMLElement) => {
    // Default tailwind classes
    const tw = "absolute top-8 left-8 p-2 bg-gray-400 text-black hover:bg-gray-600";
    const returnBtn = createButton("", tw, () => src.replaceWith(target));
    returnBtn.innerHTML = "&#8617;";
    return returnBtn;
};
