import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";

type Opts = { text: string; tw?: string; id?: string };
/**
 * Create a text element.
 * @param text text string
 * @param tw optional additional tailwind classes,
 *           default "text-6xl font-bold mb-4 text-center text-black",
 *           extendable and replacable by this param adding to it
 */
export const createParagraph = ({ text, tw = "", id }: Opts): HTMLElement => {
    const BASE_TW = "text-xl text-black";

    const resolvedText = isValidKey(text) ? getText(text) : text;
    const attributes = isValidKey(text) ? { [CONST.ATTR.I18N_TEXT]: text } : undefined;

    const twStyle = twMerge(BASE_TW, tw);

    const paragraph = createEl("p", twStyle, { text: resolvedText, attributes });
    if (id) paragraph.setAttribute("id", id);

    return paragraph;
};
