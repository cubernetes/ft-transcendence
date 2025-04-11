import { createPongEngine, defaultGameConfig } from "@darrenkuro/pong-core";
import audioManager from "../audio/AudioManager";
import { GameController } from "../input/GameController";
import { getToken } from "../menu/auth";
import { WebSocketManager } from "../net/WebSocketManager";
import { CLIRenderer } from "../renderer/CLIRenderer";
import { cleanup } from "../utils/cleanup";
import {
    MENU_MUSIC,
    PADDLE_SOUND,
    PLAYER_ONE,
    PLAYER_TWO,
    PongEngine,
    SCORE_SOUND,
    SERVER_URL,
    WALL_SOUND,
} from "../utils/config";
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
        audioManager.startMusic();
        this.controller.start();
        this.engine.start();
    }

    start2PLocal() {
        this.createEngine();
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

        this.engine.onEvent("score", (evt) => {
            audioManager.playSoundEffect(SCORE_SOUND);
        });

        this.engine.onEvent("wall-collision", (_) => {
            audioManager.playSoundEffect(WALL_SOUND);
        });

        this.engine.onEvent("paddle-collision", (_) => {
            audioManager.playSoundEffect(PADDLE_SOUND);
        });

        this.engine.onEvent("state-update", (evt) => {
            this.renderer.render(evt.state);
        });
    }

    cleanupController() {
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
    }

    stopGame(): void {
        // this.gameActive = false;
        // this.wsManager?.closeConnection();
        // this.wsManager = null;
        this.engine?.stop();
        audioManager.startMusic(MENU_MUSIC);
        this.cleanupController();
    }

    isGameRunning(): boolean {
        return this.gameActive;
    }
}

const gameManager = new GameManager();
export default gameManager;
