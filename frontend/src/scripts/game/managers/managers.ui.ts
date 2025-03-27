import {
    Mesh,
    Scene,
    Engine,
    StandardMaterial,
    Texture,
    MeshBuilder,
    ArcRotateCamera,
    Vector3,
    Color3,
    Material,
    CreateAudioEngineAsync,
    CreateSoundAsync,
    Sound,
    CreateStreamingSoundAsync,
} from "@babylonjs/core";
import { AudioManager } from "./managers.audio";
import { GameStateManager } from "./managers.state";
import { WebSocketManager } from "./managers.sockets";
import { SceneSetup } from "../game.scene";
import { logger } from "../../utils/logger";
import { Direction, GameElements } from "../game.types";
import { ASSETS_DIR } from "../../config";

export class GameUIManager {
    private container: HTMLElement;
    private gameSection: HTMLCanvasElement;
    private playButton: HTMLButtonElement;
    private gameElements!: GameElements;

    constructor(
        private gameStateManager: GameStateManager,
        private webSocketManager: WebSocketManager
    ) {
        this.container = document.createElement("div");
        this.container.className = "w-full h-[600px] relative"; // Set explicit height

        this.gameSection = document.createElement("canvas");
        this.gameSection.className = "w-full h-full";
        this.gameSection.id = "renderCanvas";

        // Add a play button
        this.playButton = document.createElement("button");
        this.playButton.textContent = "Click to Start Game";
        this.playButton.className = "container mx-auto";

        this.container.appendChild(this.playButton);
        this.container.appendChild(this.gameSection);

        this.setupEventListeners();

        this.initGame();
    }

    private async initGame() {
        const engine = new Engine(this.gameSection);

        const scene = new Scene(engine);

        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlock();
        scene.audioEnabled = true;

        const bgMusic = await CreateStreamingSoundAsync(
            "bgMusic",
            `${ASSETS_DIR}/neon-gaming.mp3`,
            {
                loop: true,
                autoplay: true,
                volume: 0.5,
            },
            audioEngine
        );

        const hitSound = await CreateSoundAsync("hitSound", `${ASSETS_DIR}/hit.wav`);

        const bounceSound = await CreateSoundAsync("bounceSound", `${ASSETS_DIR}/bounce.wav`);

        const blopSound = await CreateSoundAsync("blopSound", `${ASSETS_DIR}/blop.wav`);

        const { board, paddle1, paddle2, ball } = await SceneSetup.createGameObjects(scene);

        this.gameElements = {
            engine,
            scene,
            audioEngine,
            bgMusic,
            hitSound,
            bounceSound,
            blopSound,
            board,
            paddle1,
            paddle2,
            ball,
            // scoreText,
            // fontData,
        };
    }

    private setGame() {
        const { scene, engine, board, paddle1, paddle2, ball } = this.gameElements;
        SceneSetup.setupScene(scene);
        SceneSetup.setCamera(scene);
        // SceneSetup.createAudioEngine(scene);
        SceneSetup.createFunctions(scene);

        this.gameStateManager.setBall(ball);
        this.gameStateManager.setPaddles(paddle1, paddle2);

        this.setupKeyboardControls();

        this.webSocketManager.setupMessageHandler(scene);

        engine.runRenderLoop(() => {
            scene.render();
        });

        window.addEventListener("resize", () => {
            engine.resize();
        });
    }

    setupEventListeners() {
        this.playButton?.addEventListener("click", () => {
            this.playButton?.remove();
            this.webSocketManager.startGame();
            // this.audioManager.playSound("background");
            this.setGame();
        });

        this.container?.addEventListener("destroy", () => {
            // this.audioManager.stopAllSounds();
            //TODO: Add additional functionality when window is closed such as websockets closing?
        });
    }

    setupKeyboardControls() {
        document.addEventListener("keydown", (event) => {
            logger.info(`Key pressed: ${event.key}`);
            if (event.key === "ArrowUp" || event.key === "w") {
                this.webSocketManager.sendDirection("up");
            } else if (event.key === "ArrowDown" || event.key === "s") {
                this.webSocketManager.sendDirection("down");
            }
        });

        document.addEventListener("keyup", (event) => {
            logger.info(`Key released: ${event.key}`);
            if (["ArrowUp", "ArrowDown", "w", "s"].includes(event.key)) {
                this.webSocketManager.sendDirection("stop");
            }
        });
    }

    getContainer() {
        return this.container;
    }
}
