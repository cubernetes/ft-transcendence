import { twMerge } from "tailwind-merge";
import { createEl, replaceChildren } from "../../utils/dom-helper";
import { createButton } from "./Button";
import { createContainer } from "./Container";

type Opts = {
    children: UIComponent;
    tw?: string;
    exitable?: boolean;
};

export const createModal = ({ children, tw = "", exitable = true }: Opts) => {
    const BASE_TW = [
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "shadow-md bg-white rounded p-6 z-50",
    ].join(" ");

    //w-1/2 h-1/2
    //flex-col justify-center mx-auto
    const overlayEl = createEl("div", "fixed inset-0 bg-black bg-opacity-50 z-10", {
        attributes: { id: CONST.ID.MODAL_OVERLAY },
    });
    const twStyle = twMerge(BASE_TW, tw);
    const container = createContainer({
        tw: twStyle,
        id: CONST.ID.MODAL_CTN,
        children,
    });

    const close = () => {
        replaceChildren(container, []);
        document.body.removeChild(overlayEl);
        document.body.removeChild(container);
    };

    const exitBtn = createButton({
        innerHTML: "&times;",
        click: close,
        tw: "absolute top-1 right-2 text-red-600 text-4xl font-bold cursor-pointer z-50",
    });

    if (exitable) container.appendChild(exitBtn);

    document.body.append(overlayEl, container);
    return close;
};
