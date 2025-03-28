import { GameUIManager } from "./managers/managers.ui";
import earcut from "earcut";
(window as any).earcut = earcut;

export const create3DGameSection = async (): Promise<HTMLElement> => {
    const gameUIManager = new GameUIManager();
    return gameUIManager.getContainer();
};
