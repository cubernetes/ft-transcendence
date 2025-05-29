import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";

type Opts = {
    text: string;
    tw?: string;
    tag?: "h1" | "h2" | "h3";
    i18nVars?: Record<string, string | number>;
};

/**
 * Create a heading text element.
 * @param text text string
 * @param tw optional additional tailwind classes,
 *           default "text-2xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 * @param tag HTMLElementTagName, default is h2
 */
export const createHeading = ({
    text,
    tw = "",
    tag = "h2",
    i18nVars = {},
}: Opts): HTMLHeadingElement => {
    const BASE_TW = `${CONST.FONT.H5} font-bold mb-4 text-center text-black`;

    const twStyle = twMerge(BASE_TW, tw);
    const title = createEl(tag, twStyle, { text, i18nVars });

    return title;
};
