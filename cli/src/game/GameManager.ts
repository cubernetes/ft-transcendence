import ora from "ora";
import {
    AIDifficulty,
    PongConfig,
    PongState,
    createPongEngine,
    defaultGameConfig,
} from "@darrenkuro/pong-core";
import audioManager from "../audio/AudioManager";
import { GameController } from "../input/GameController";
import { mainMenu } from "../menu/mainMenu";
import { printTitle } from "../menu/mainMenu";
import { WebSocketManager } from "../net/WebSocketManager";
import { CLIRenderer } from "../renderer/CLIRenderer";
import {
    API_URL,
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

    private default: PongConfig;

    constructor() {
        this.renderer = new CLIRenderer();
        this.engine = createPongEngine();
        this.default = structuredClone(defaultGameConfig);
    }

    start1PLocal(difficulty: AIDifficulty) {
        this.engine.reset({ aiMode: true, aiDifficulty: difficulty });
        this.configEngine();
        this.renderer.updateResolution();

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
        this.engine.reset({ aiMode: false });
        this.configEngine();
        this.renderer.updateResolution();

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

    async join1PRemote() {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        this.wsManager.active = true;
        this.renderer.updateResolution();

        const spinner = ora("Waiting for the host to start the game...").start();

        // Wait for the "game-start" event from the WebSocketManager
        await new Promise<void>((resolve, reject) => {
            this.wsManager.once("game-start", () => {
                spinner.succeed("Game started!");
                resolve();
            });

            this.wsManager.once("lobby-remove", () => {
                spinner.fail("You have been removed from the lobby.");
                reject();
            });
        }).catch(() => {
            this.wsManager.active = false;
            mainMenu();
        });

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

    setRemoteGame(gameID: string, opponent: number, playerID: number) {
        this.remoteGameId = gameID;
        this.remotePlayerIndex = playerID;
        this.opponentId = opponent;
    }

    setWSActive(acitve: boolean) {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        this.wsManager.active = acitve;
    }

    configEngine() {
        this.engine.onEvent("game-end", (evt) => {
            // this.wsManager.active = false;
            audioManager.playSoundEffect(SCORE_SOUND);
            audioManager.startMusic(VICTORY_MUSIC);
            this.cleanupController();
            this.renderer.showWinner(evt.winner).then(() => {
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

        this.engine.onEvent("ball-reset", (_) => {
            // audioManager.playSoundEffect(SCORE_SOUND);
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
        if (this.wsManager) {
            this.wsManager.active = false;
        }
        this.cleanupController();
        this.engine?.stop();
    }
}

const gameManager = new GameManager();
export default gameManager;
