import { GameUIManager } from "./managers/managers.ui";
import earcut from "earcut";
(window as any).earcut = earcut;

let gameStateManager: GameStateManager | null = null;
let webSocketManager: WebSocketManager | null = null;
let gameUIManager: GameUIManager | null = null;

export const create3DGameSection = async (): Promise<HTMLElement> => {
    const gameUIManager = new GameUIManager();
    return gameUIManager.getContainer();
};
