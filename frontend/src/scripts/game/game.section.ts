import { AudioManager } from "./managers/managers.audio";
import { GameStateManager } from "./managers/managers.state";
import { WebSocketManager } from "./managers/managers.sockets";
import { GameUIManager } from "./managers/managers.ui";
import earcut from "earcut";
(window as any).earcut = earcut;

let gameStateManager: GameStateManager | null = null;
let webSocketManager: WebSocketManager | null = null;
let gameUIManager: GameUIManager | null = null;

export const create3DGameSection = async (): Promise<HTMLElement> => {
    // const audioManager = new AudioManager();
    if (!gameStateManager) {
        gameStateManager = new GameStateManager();
    }
    if (!webSocketManager) {
        webSocketManager = new WebSocketManager(gameStateManager);
    }
    if (!gameUIManager) {
        gameUIManager = new GameUIManager(gameStateManager, webSocketManager);
    }

    return gameUIManager.getContainer();
};
