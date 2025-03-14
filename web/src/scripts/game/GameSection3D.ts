import { AudioManager } from "./managers/Audio";
import { GameStateManager } from "./managers/GameState";
import { WebSocketManager } from "./managers/WebSocket";
import { GameUIManager } from "./managers/GameUI";
import earcut from "earcut";
(window as any).earcut = earcut;

export async function create3DGameSection(): Promise<HTMLElement> {
    const audioManager = new AudioManager();
    const gameStateManager = new GameStateManager(audioManager);
    const webSocketManager = new WebSocketManager(gameStateManager);
    const gameUIManager = new GameUIManager(audioManager, gameStateManager, webSocketManager);

    return gameUIManager.getContainer();
}
