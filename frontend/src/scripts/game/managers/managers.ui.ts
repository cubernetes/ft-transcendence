import { GameInstance } from "../game.instance";
import { Direction } from "../game.types";

export class GameUIManager {
    private container: HTMLElement;
    private gameSection: HTMLCanvasElement;
    private playButton: HTMLButtonElement;
    private gameInstance!: GameInstance;

    constructor() {
        this.container = document.createElement("div");
        this.container.className = "w-full h-[600px] relative";

        this.gameSection = document.createElement("canvas");
        this.gameSection.className = "w-full h-full";
        this.gameSection.id = "renderCanvas";

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
            this.initGame();
        });
    }

    async initGame() {
        this.gameInstance = await GameInstance.getInstance(this.gameSection);
        if (!this.gameInstance) {
            console.error("Game instance not found");
            return;
        }
        this.gameInstance.getWebSocketManager().setupSocketHandlers();
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        document.addEventListener("keydown", (event) => {
            console.log(`Key pressed: ${event.key}`);
            if (event.key === "ArrowUp" || event.key === "w") {
                this.gameInstance.getWebSocketManager().sendDirection("up");
            } else if (event.key === "ArrowDown" || event.key === "s") {
                this.gameInstance.getWebSocketManager().sendDirection("down");
            }
        });

        document.addEventListener("keyup", (event) => {
            console.log(`Key released: ${event.key}`);
            if (["ArrowUp", "ArrowDown", "w", "s"].includes(event.key)) {
                this.gameInstance.getWebSocketManager().sendDirection("stop");
            }
        });
    }

    getContainer() {
        return this.container;
    }
}
