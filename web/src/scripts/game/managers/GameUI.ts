import { Scene, Engine } from "@babylonjs/core";
import { AudioManager } from "./Audio";
import { GameStateManager } from "./GameState";
import { WebSocketManager } from "./WebSocket";
import { SceneSetup } from "../SceneSetup";
import { Direction } from "../game.types";

export class GameUIManager {
    private container: HTMLElement;
    private gameSection: HTMLCanvasElement;
    private playButton: HTMLButtonElement;

    constructor(
        private audioManager: AudioManager,
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
    }

    setupEventListeners() {
        this.playButton?.addEventListener("click", () => {
            this.playButton?.remove();
            this.webSocketManager.startGame();
            this.audioManager.playSound("background");
            this.initGame();
        });

        this.container?.addEventListener("destroy", () => {
            this.audioManager.stopAllSounds();
            //TODO: Add additional functionality when window is closed such as websockets closing?
        });
    }

    initGame() {
        const engine = new Engine(this.gameSection);
        const scene = new Scene(engine);

        SceneSetup.setupScene(scene);
        SceneSetup.setCamera(scene);

        const { board, paddle1, paddle2, ball } = SceneSetup.createGameObjects(scene);
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

    setupKeyboardControls() {
        document.addEventListener("keydown", (event) => {
            console.log(`Key pressed: ${event.key}`);
            if (event.key === "ArrowUp" || event.key === "w") {
                this.webSocketManager.sendDirection("up");
            } else if (event.key === "ArrowDown" || event.key === "s") {
                this.webSocketManager.sendDirection("down");
            }
        });

        document.addEventListener("keyup", (event) => {
            console.log(`Key released: ${event.key}`);
            if (["ArrowUp", "ArrowDown", "w", "s"].includes(event.key)) {
                this.webSocketManager.sendDirection("stop");
            }
        });
    }

    getContainer() {
        return this.container;
    }
}
