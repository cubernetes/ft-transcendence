import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";

type Opts = { text: string; tw?: string; id?: string; i18nVars?: Record<string, string | number> };

/**
 * Create a text element.
 * @param text text string
 * @param tw optional additional tailwind classes,
 *           default "text-6xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 */
export const createParagraph = ({ text, tw = "", id, i18nVars = {} }: Opts): HTMLElement => {
    const BASE_TW = `${CONST.FONT.BODY_SM} text-black`;

    const twStyle = twMerge(BASE_TW, tw);

    const paragraph = createEl("p", twStyle, { text, i18nVars });
    if (id) paragraph.setAttribute("id", id);

    return paragraph;
};
