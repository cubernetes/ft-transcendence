import { twMerge } from "tailwind-merge";
import { getText, isValidKey } from "../../modules/locale/locale.store";
import { createEl } from "../../utils/dom-helper";

type Opts = {
    ph: string; // Placeholder
    tw?: string;
    type?: string;
    ac?: string; // Autocomplete
};

/**
 * Create a HTML Input element.
 * @params ph placeholder
 * @params ac autocomplete
 */
export const createInput = ({ ph, tw = "", type = "text", ac = "on" }: Opts): HTMLInputElement => {
    const BASE_TW = "rounded w-full p-2 border border-gray-300";

    // bg-gray-100 hover:bg-gray-400
    // maybe select-none? dones't seem to be needed, disabled:opacity-50 font-medium transition
    // inline-block

    const placeholder = isValidKey(ph) ? getText(ph) : ph;
    const attributes = isValidKey(ph) ? { [CONST.ATTR.I18N_INPUT]: ph } : undefined;
    const twStyle = twMerge(BASE_TW, tw);
    const props = { placeholder, type, autocomplete: ac };

    return createEl("input", twStyle, { attributes, props });
};
