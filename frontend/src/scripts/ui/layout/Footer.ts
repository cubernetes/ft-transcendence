import { createEl } from "../../utils/dom-helper";

export const createFooter = (): HTMLElement => {
    const footer = createEl("footer", "bg-gray-200 p-4 text-center font-medieval hidden", {
        children: [createEl("p", "", { text: "© 2025 ft-transcendence" })],
    });

    return footer;
};
