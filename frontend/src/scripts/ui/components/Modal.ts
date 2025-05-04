import { createEl, replaceChildren } from "../../utils/dom-helper";
import { createContainer } from "./Container";

export const createModal = (children: UIComponent): void => {
    const overlayEl = createEl("div", "fixed inset-0 bg-black bg-opacity-50 z-10");
    const container = createContainer({
        tw: [
            "fixed inset-0 w-1/2 h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "flex-col justify-center shadow-md bg-white rounded p-6 z-50",
        ].join(" "),
        children,
    });

    // TODO: refactor this
    const exitBtn = createEl(
        "button",
        "absolute top-1 right-2 text-red-600 text-4xl font-bold cursor-pointer z-50",
        {
            props: { innerHTML: "&times;" },
            events: {
                click: () => {
                    replaceChildren(container, []);
                    document.body.removeChild(overlayEl);
                    document.body.removeChild(container);
                    document.body.removeChild(exitBtn);
                },
            },
        }
    );
    container.appendChild(exitBtn);

    document.body.append(overlayEl, container);
};
