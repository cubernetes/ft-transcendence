import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";

type Opts = { text: string; tw?: string; tag?: "h1" | "h2" | "h3" };

/**
 * Create a heading text element.
 * @param text text string
 * @param tw optional additional tailwind classes,
 *           default "text-6xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 * @param tag HTMLElementTagName, default is h2
 */
export const createHeading = ({ text, tw = "", tag = "h2" }: Opts): HTMLHeadingElement => {
    const BASE_TW = "text-4xl font-bold mb-4 text-center text-black";

    const twStyle = twMerge(BASE_TW, tw);
    const title = createEl(tag, twStyle, { text });

    return title;
};
