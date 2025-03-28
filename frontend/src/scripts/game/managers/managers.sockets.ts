import { logger } from "../../utils/logger";
import { Direction } from "../game.types";
import { GameStateManager } from "./managers.state";

export class WebSocketManager {
    socket: WebSocket;
    lastDirection: string = "stop";

    constructor(private gameStateManager: GameStateManager) {
        this.socket = new WebSocket("/ws");
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.socket.onmessage = (event) => {
            this.gameStateManager.updateGameObjects(event.data);
        };

        this.socket.onopen = () => {
            logger.info("WebSocket connection established.");
        };

        this.socket.onerror = (error) => {
            logger.error("WebSocket error:", error);
        };

        this.socket.onclose = () => {
            logger.info("WebSocket connection closed.");
        };
    }

    startGame() {
        if (this.socket.readyState === WebSocket.OPEN) {
            logger.info("Sending startPong");
            this.socket.send("startPong"); // Start the game
            // this.gameStateManager
        } else {
            logger.error("WebSocket is not open.");
        }
    }

    sendDirection(direction: Direction) {
        logger.info("Sending direction:", direction);
        if (direction !== this.lastDirection && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(`move ${direction}`);
            this.lastDirection = direction;
        }
    }
}
