import { AudioManager } from "./managers/managers.audio";
import { GameStateManager } from "./managers/managers.state";
import { WebSocketManager } from "./managers/managers.sockets";
import { GameUIManager } from "./managers/managers.ui";
import earcut from "earcut";
(window as any).earcut = earcut;

export const create3DGameSection = async (): Promise<HTMLElement> => {
    // const audioManager = new AudioManager();
    const gameStateManager = new GameStateManager();
    const webSocketManager = new WebSocketManager(gameStateManager);
    const gameUIManager = new GameUIManager(gameStateManager, webSocketManager);

    return gameUIManager.getContainer();
};
