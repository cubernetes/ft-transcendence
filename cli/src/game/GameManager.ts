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
import { askLobbyLeave, promptRemotePlayMenu } from "../menu/remoteMenu";
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

    private currentLobbyId: string | null = null;
    private remoteGameId: string | null = null;
    private remotePlayerIndex: number | null = null;
    private opponentId: number | null = null;

    private default: PongConfig;
    private remoteConfig: PongConfig | null = null;

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
        this.setWSActive(true);
        this.renderer.updateResolution();

        let removedFromLobby = false;

        function onLobbyRemove() {
            if (!removedFromLobby) {
                this.setWSActive(false);
                removedFromLobby = true;
                this.wsManager.off("game-start", onGameStart);
                return promptRemotePlayMenu("You have left the lobby.");
            }
        }
        function onGameStart() {
            this.wsManager.off("lobby-remove", onLobbyRemove);
            this.startRemoteGame();
        }

        this.wsManager.once("game-start", onGameStart);
        this.wsManager.once("lobby-remove", onLobbyRemove);

        await askLobbyLeave(this.currentLobbyId);

        if (!removedFromLobby) {
            this.setWSActive(false);
            this.wsManager.off("game-start", onGameStart);
            this.wsManager.off("lobby-remove", onLobbyRemove);
            return promptRemotePlayMenu("You have left the lobby.");
        }
    }

    async startRemoteGame() {
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

    async start1PRemote() {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        this.wsManager.active = true;
        this.renderer.updateResolution();

        this.wsManager.sendGameStart();

        this.startRemoteGame();
    }

    setCurrentLobbyId(lobbyId: string | null) {
        this.currentLobbyId = lobbyId;
    }

    getCurrentLobbyId(): string | null {
        return this.currentLobbyId;
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

    getWSManager() {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        return this.wsManager;
    }

    setRemoteConfig(payload: any) {
        this.remoteConfig = payload;
    }

    getRemoteConfig() {
        return this.remoteConfig || this.default;
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
