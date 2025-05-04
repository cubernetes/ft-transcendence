import { twMerge } from "tailwind-merge";
import { createEl } from "../../utils/dom-helper";

type Opts = { tw?: string; children?: HTMLElement[]; tag?: keyof HTMLElementTagNameMap };

export const createContainer = ({ tw = "", tag = "div", children }: Opts): HTMLElement => {
    // Default tailwind style to be applied, additional styles will be merged
    const BASE_TW = "relative w-full flex mx-auto text-center";
    const twStyle = twMerge(BASE_TW, tw);

    const container = createEl(tag, twStyle, { children });

    return container;
};
