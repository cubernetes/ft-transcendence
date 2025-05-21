import { twMerge } from "tailwind-merge";
import { createEl } from "../../utils/dom-helper";

type Opts = {
    tw?: string;
    children?: HTMLElement[];
    tag?: keyof HTMLElementTagNameMap;
    id?: string;
};

export const createContainer = ({ tw = "", tag = "div", children, id }: Opts): HTMLElement => {
    // Default tailwind style to be applied, additional styles will be merged
    const BASE_TW = "relative text-center";
    const twStyle = twMerge(BASE_TW, tw);

    // mx-auto, flex, w-full
    const container = createEl(tag, twStyle, { children });

    if (id) container.setAttribute("id", id);
    return container;
};
