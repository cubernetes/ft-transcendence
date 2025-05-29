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
import { leaveLobby } from "../menu/remoteMenu";
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

    // LOGIN-data:
    private username: string | null = null;
    private displayName: string | null = null;

    private currentLobbyId: string | null = null;

    // REMOTE-data:
    private remoteGameId: string | null = null;
    private remotePlayerIndex: number | null = null;
    private opponentId: string | null = null;
    private playerNames: string[] = [];
    // private opponentName: string | null = null;

    private default: PongConfig;
    private remoteConfig: PongConfig | null = null;

    constructor() {
        this.renderer = new CLIRenderer();
        this.engine = createPongEngine();
        this.default = structuredClone(defaultGameConfig);
    }

    start1PLocal(input: Partial<PongConfig>) {
        this.engine.reset(defaultGameConfig);
        this.engine.reset(input);
        this.configEngine();

        const aiLevel = input.aiDifficulty ? input.aiDifficulty.toString() : "spoooky";
        this.renderer.setPlayerNames(["YOU", `AI: ${aiLevel}`]);
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

    start2PLocal(input: Partial<PongConfig>) {
        this.engine.reset(defaultGameConfig);
        this.engine.reset(input);
        this.configEngine();

        this.renderer.setPlayerNames(null);
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

	updateRendererRes() {
        this.setWSActive(true);
        this.renderer.updateResolution();
	}

    async join1PRemote() {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        this.setWSActive(true);
        this.renderer.updateResolution();

        let removedFromLobby = false;

        const onLobbyRemove = () => {
            if (!removedFromLobby) {
                this.setWSActive(false);
                removedFromLobby = true;
                this.wsManager.off("game-start", onGameStart);
                return promptRemotePlayMenu("You have left the lobby.");
            }
        };
        const onGameStart = () => {
            this.wsManager.off("lobby-remove", onLobbyRemove);
            this.startRemoteGame(false);
        };

        this.wsManager.on("game-start", onGameStart);
        this.wsManager.once("lobby-remove", onLobbyRemove);

        await askLobbyLeave(this.currentLobbyId);

        if (!removedFromLobby) {
            this.setWSActive(false);
            this.wsManager.off("game-start", onGameStart);
            this.wsManager.off("lobby-remove", onLobbyRemove);
            return promptRemotePlayMenu("You have left the lobby.");
        }
    }

    async startRemoteGame(host: boolean) {
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
                                // gameId: this.remoteGameId,
                                // index: this.remotePlayerIndex,
                                action: dir,
                            },
                        })
                    ),
            },
        ]);
        this.controller.start();

        await this.wsManager.sendGameStart(host);
    }

    async start1PRemote() {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        this.wsManager.active = true;
        this.renderer.updateResolution();

        this.startRemoteGame(true);
    }

    setCurrentLobbyId(lobbyId: string | null) {
        this.currentLobbyId = lobbyId;
    }

    getCurrentLobbyId(): string | null {
        return this.currentLobbyId;
    }

    setDisplayName(name: string) {
        this.displayName = name;
    }

    getDisplayName(): string | null {
        return this.displayName;
    }

    setUsername(name: string) {
        this.username = name;
    }

    getUsername(): string | null {
        return this.username;
    }

    setPlayerNames(playerNames: string[]) {
        this.playerNames = playerNames;
    }

    getPlayerNames(): string[] {
        return this.playerNames;
    }

    setRemoteGame(gameID: string, opponent: string, playerID: number) {
        this.remoteGameId = gameID;
        this.opponentId = opponent;
        this.remotePlayerIndex = playerID;
    }

    setWSActive(active: boolean) {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        this.wsManager.active = active;
    }

    getWSManager() {
        if (!this.wsManager) {
            this.wsManager = new WebSocketManager(SERVER_URL);
        }
        return this.wsManager;
    }

    setRemoteConfig(payload: any) {
        this.remoteConfig = payload;
        if (payload.playerNames && Array.isArray(payload.playerNames)) {
            this.setPlayerNames(payload.playerNames);
            this.renderer.setPlayerNames(payload.playerNames);
        }
    }

    getRemoteConfig() {
        return this.remoteConfig || this.default;
    }

    setRenderBoardSize(width: number, depth: number) {
        this.renderer.setBoardSize(width, depth);
    }

    configEngine() {
        this.engine.onEvent("game-end", (evt) => {
            audioManager.playSoundEffect(SCORE_SOUND);
            audioManager.startMusic(VICTORY_MUSIC);
            this.cleanupController();
            this.renderer.showWinner(evt, this.renderer.getPlayerNames()).then(() => {
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

    showRemoteWinner(payload: any) {
        audioManager.startMusic(VICTORY_MUSIC);
        this.cleanupController();
        this.renderer.showWinner(payload, this.playerNames, this.opponentId).then(() => {
            leaveLobby();
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
