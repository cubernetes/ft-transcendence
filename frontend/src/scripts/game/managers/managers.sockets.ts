import { Direction } from "../game.types";
import { GameStateManager } from "./managers.state";
import { Scene } from "@babylonjs/core";

export class WebSocketManager {
    socket: WebSocket;
    lastDirection: Direction = "stop";

    constructor(private gameStateManager: GameStateManager) {
        this.socket = new WebSocket("/ws");
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.socket.onopen = () => {
            console.log("WebSocket connection established.");
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };
    }

    startGame() {
        if (this.socket.readyState === WebSocket.OPEN) {
            console.log("Sending startPong");
            this.socket.send("startPong"); // Start the game
            // this.gameStateManager
        } else {
            console.error("WebSocket is not open.");
        }
    }

    sendDirection(direction: Direction) {
        console.log("Sending direction:", direction);
        if (direction !== this.lastDirection && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(`move ${direction}`);
            this.lastDirection = direction;
        }
    }

    setupMessageHandler(scene: Scene) {
        this.socket.onmessage = (event) => {
            this.gameStateManager.updateGameObjects(event.data, scene);
        };
    }
}
