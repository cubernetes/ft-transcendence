import { GameUIManager } from "./managers/managers.ui";
import earcut from "earcut";
(window as any).earcut = earcut;

let gameUIManager: GameUIManager | null = null;

export const create3DGameSection = async (): Promise<HTMLElement> => {
    if (!gameUIManager) {
        gameUIManager = new GameUIManager();
    }
    return gameUIManager.getContainer();
};
