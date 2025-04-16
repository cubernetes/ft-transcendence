import { PongState, createPongEngine, defaultGameConfig } from "@darrenkuro/pong-core";
import audioManager from "../audio/AudioManager";
import { GameController } from "../input/GameController";
import { getToken } from "../menu/auth";
import { mainMenu } from "../menu/mainMenu";
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
    VICTORY_MUSIC,
    WALL_SOUND,
} from "../utils/config";
import { userOptions } from "../utils/config";

export class GameManager {
    private controller: GameController | null = null;
    private engine: PongEngine;
    private renderer: CLIRenderer;
    private wsManager: WebSocketManager | null = null;

    private activeGame: string | null = null;

    private remoteGameId: string | null = null;
    private remotePlayerIndex: number | null = null;
    private opponentId: number | null = null;

    constructor() {
        this.renderer = new CLIRenderer();
        this.engine = createPongEngine(defaultGameConfig);
        this.configEngine();
    }

    start1PLocal() {
        this.cleanupController();
        this.controller = new GameController([
            {
                player: PLAYER_ONE,
                keyMap: userOptions.p1Keys,
                onMove: (player, dir) => this.engine.setInput(player, dir),
            },
        ]);
        audioManager.startMusic();
        this.engine.start();
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
        audioManager.startMusic();
        this.engine.start();
        this.controller.start();
    }

    async start1PRemote() {
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

        await this.wsManager.sendGameStart();
    }
    // "game-action": {
    // gameId: string;
    // index: number;
    // action: UserInput;
    // };
    setRemoteGame(gameID: string, opponent: number, playerID: number) {
        this.remoteGameId = gameID;
        this.remotePlayerIndex = playerID;
        this.opponentId = opponent;
    }

    // "wall-collision"?: EventCallback<"wall-collision">[] | undefined;
    // "paddle-collision"?: EventCallback<"paddle-collision">[] | undefined;
    // "state-update"?: EventCallback<"state-update">[] | undefined;
    // "score-update"?: EventCallback<"score-update">[] | undefined;
    // "ball-reset"?: EventCallback<"ball-reset">[] | undefined;
    // "game-start"?: EventCallback<"game-start">[] | undefined;
    // "game-end"?: EventCallback<"game-end">[] | undefined;
    configEngine() {
        this.engine.onEvent("game-start", (_) => {});

        this.engine.onEvent("game-end", (evt) => {
            audioManager.playSoundEffect(SCORE_SOUND);
            audioManager.startMusic(VICTORY_MUSIC);
            this.cleanupController();
            this.renderer.showWinner(0).then(() => {
                this.engine = null;
                mainMenu();
            });
        });

        this.engine.onEvent("score-update", (evt) => {
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

    renderRemoteState(state: PongState) {
        this.renderer.render(state);
    }

    showRemoteWinner(winner: number) {
        audioManager.startMusic(VICTORY_MUSIC);
        this.cleanupController();
        this.renderer.showWinner(winner).then(() => {
            mainMenu();
        });
    }

    cleanupController() {
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
    }

    stopGame(): void {
        this.cleanupController();
        this.engine?.stop();
    }
}

const gameManager = new GameManager();
export default gameManager;
