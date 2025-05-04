import { twMerge } from "tailwind-merge";
import { createEl, replaceChildren } from "../../utils/dom-helper";
import { createContainer } from "./Container";

type Opts = {
    children: UIComponent;
    tw?: string;
};

export const createModal = ({ children, tw = "" }: Opts) => {
    const BASE_TW = [
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "flex-col justify-center mx-auto shadow-md bg-white rounded p-6 z-50",
    ].join(" ");

    //w-1/2 h-1/2
    const overlayEl = createEl("div", "fixed inset-0 bg-black bg-opacity-50 z-10");
    const twStyle = twMerge(BASE_TW, tw);
    const container = createContainer({
        tw: twStyle,
        children,
    });

    const close = () => {
        replaceChildren(container, []);
        document.body.removeChild(overlayEl);
        document.body.removeChild(container);
    };

    // TODO: refactor this
    const exitBtn = createEl(
        "button",
        "absolute top-1 right-2 text-red-600 text-4xl font-bold cursor-pointer z-50",
        {
            props: { innerHTML: "&times;" },
            events: { click: close },
        }
    );
    container.appendChild(exitBtn);

    document.body.append(overlayEl, container);
    return close;
};
