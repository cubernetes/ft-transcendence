import { ICLIGameState, IServerGameState } from "./game.types";
import WebSocket from "ws";
import { renderGameState } from "./GameRendering";
import { vec3ToVec2D } from "./utils";
import { mainMenu, getGameActive } from "./index";

export class WebSocketManager {
    private ws: WebSocket;
    private paused: boolean = false; // Flag to indicate if the game is paused

    constructor(private serverUrl: string) {
        this.ws = new WebSocket(this.serverUrl);

        // WebSocket connection open
        this.ws.on("open", () => {
            console.log("Connected to the server");
        });

        // Handle incoming messages from the server
        this.ws.on("message", this.onMessage.bind(this));
    }

    // Method to send a direction change to the server
    sendMessage(response: string) {
        // console.log(`[SEND] ${response}`);
        this.ws.send(response);
    }

    // Handle the server's game state updates
    onMessage(data: WebSocket.Data) {
        if (!getGameActive()) {
            return;
        }
        const rawGameState: IServerGameState = JSON.parse(data.toString());
        const cliGameState: ICLIGameState = {
            ball: vec3ToVec2D(rawGameState.ballPosition),
            paddle1: vec3ToVec2D(rawGameState.paddlePosition["player-1"]),
            paddle2: vec3ToVec2D(rawGameState.paddlePosition["player-2"]),
            score: rawGameState.score,
            gameRunning: true,
            lastCollisionEvents: rawGameState.collisionEvents,
        };
        renderGameState(cliGameState);
    }

    // Method to pause and show the menu
    pauseGame() {
        this.paused = true;
        console.log("Game paused. Returning to menu...");
        mainMenu();
    }

    // Resume the game and allow rendering
    resumeGame() {
        this.paused = false;
        console.log("Game resumed.");
    }

    // Toggle the pause state and render the menu
    togglePause() {
        if (this.paused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    closeConnection() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        }
    }
}
