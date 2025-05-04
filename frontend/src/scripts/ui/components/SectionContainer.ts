import { createEl } from "../../utils/dom-helper";

// TODO: DELETE
/**
 * @default tw "rounded-lg shadow-md mx-auto flex flex-col justify-center"
 */
export const createSectionContainer = (tw: string = "", children?: HTMLElement[]): HTMLElement => {
    const baseTw = "rounded-lg shadow-md mx-auto flex flex-col justify-center";
    const fullTw = `${baseTw} ${tw}`;

    const section = createEl("section", fullTw, { children });

    return section;
};
