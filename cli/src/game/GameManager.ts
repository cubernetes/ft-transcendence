import { createPongEngine, defaultGameConfig } from "@darrenkuro/pong-core";
import { GameController } from "../input/GameController";
import { getToken } from "../menu/auth";
import { WebSocketManager } from "../net/WebSocketManager";
import { CLIRenderer } from "../renderer/CLIRenderer";
import { cleanup } from "../utils/cleanup";
import { PLAYER_ONE, PLAYER_TWO, PongEngine, SERVER_URL } from "../utils/config";
import { userOptions } from "../utils/config";

export class GameManager {
    private controller: GameController | null = null;
    private engine: PongEngine | null = null;
    private renderer: CLIRenderer;
    private wsManager: WebSocketManager | null = null;
    private gameActive = false;
    private remoteGameId: string | null = null;
    private remotePlayerIndex: number | null = null;

    constructor() {
        this.renderer = new CLIRenderer();
    }

    start1PLocal() {
        this.createEngine();
        this.cleanupController();
        this.controller = new GameController([
            {
                player: PLAYER_ONE,
                keyMap: userOptions.p1Keys,
                onMove: (player, dir) => this.engine.setInput(player, dir),
            },
        ]);
        this.controller.start();
    }

    start2PLocal() {
        this.cleanupController();
        this.controller = new GameController([
            {
                player: PLAYER_ONE,
                keyMap: userOptions.p1Keys,
                onMove: (player, dir) => this.engine.setInput(player, dir),
            },
            {
                player: PLAYER_TWO,
                keyMap: userOptions.p2Keys,
                onMove: (player, dir) => this.engine.setInput(player, dir),
            },
        ]);
        this.controller.start();
    }

    start1PRemote() {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        this.cleanupController();
        this.controller = new GameController([
            {
                player: PLAYER_ONE,
                keyMap: userOptions.p1Keys,
                onMove: (_player, dir) =>
                    this.wsManager.sendMessage(
                        JSON.stringify({
                            type: "game-action",
                            payload: {
                                gameId: this.remoteGameId,
                                index: this.remotePlayerIndex,
                                action: dir,
                            },
                        })
                    ),
            },
        ]);
        this.controller.start();
    }

    createEngine() {
        if (this.engine) {
            return;
        }
        this.engine = createPongEngine(defaultGameConfig);

        this.engine.onEvent("game-start", (_) => {});

        this.engine.onEvent("game-end", (evt) => {});

        this.engine.onEvent("score", (evt) => {});

        this.engine.onEvent("wall-collision", (_) => {});

        this.engine.onEvent("paddle-collision", (_) => {});

        this.engine.onEvent("state-update", (evt) => {});
    }

    cleanupController() {
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
    }

    stopGame(): void {
        this.gameActive = false;
        this.wsManager?.closeConnection();
        this.wsManager = null;
    }

    isGameRunning(): boolean {
        return this.gameActive;
    }
}

const gameManager = new GameManager();
export default gameManager;
