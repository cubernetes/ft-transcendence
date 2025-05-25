import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";

type Opts = {
    ph: string; // Placeholder
    tw?: string;
    type?: string;
    ac?: string; // Autocomplete
    id?: string;
    i18nVars?: Record<string, string | number>;
};

/**
 * Create a HTML Input element.
 * @params ph placeholder
 * @params ac autocomplete
 */
export const createInput = ({
    ph,
    tw = "",
    type = "text",
    ac = "on",
    id,
    i18nVars,
}: Opts): HTMLInputElement => {
    const BASE_TW = `rounded w-full p-2 border border-gray-300 ${CONST.FONT.BODY_XS}`;

    // bg-gray-100 hover:bg-gray-400
    // maybe select-none? dones't seem to be needed, disabled:opacity-50 font-medium transition
    // inline-block

    const placeholder = isValidKey(ph) ? getText(ph, i18nVars) : ph;
    const attributes = isValidKey(ph) ? { [CONST.ATTR.I18N_INPUT]: ph } : undefined;
    const twStyle = twMerge(BASE_TW, tw);
    const props = { placeholder, type, autocomplete: ac };

    const input = createEl("input", twStyle, { attributes, props });

    if (id) input.setAttribute("id", id);
    if (i18nVars) input.setAttribute(CONST.ATTR.I18N_VARS, JSON.stringify(i18nVars));

    return input;
};
