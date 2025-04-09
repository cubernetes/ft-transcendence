import WebSocket from "ws";
import { renderGameState } from "./GameRendering";
import { getGameActive, mainMenu } from "./index";
import { vec3ToVec2D } from "./utils";

export class WebSocketManager {
    private ws: WebSocket;
    private paused: boolean = false; // Flag to indicate if the game is paused

    constructor(private serverUrl: string) {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.on("open", () => {
            // console.log("Connected to the server");
        });

        // Handle incoming messages from the server
        this.ws.on("message", this.onMessage.bind(this));
    }

    // -------------- copied from frontend
    sendGameStart() {
        console.log("in function sendGameStart");
        if (this.socket.readyState === WebSocket.OPEN) {
            logger.info("Sending game-start");

            const jwtToken: string | null = localStorage.getItem("token");
            if (!jwtToken) {
                logger.error("JWT token not found in local storage.");
                return;
            }

            logger.info("JWT token:", jwtToken);

            const message = JSON.stringify({
                type: "game-start",
                payload: {
                    token: jwtToken,
                },
            });
            this.socket.send(message);
            console.log("Game start message sent:", message);
        } else {
            logger.error("WebSocket is not open.");
        }
    }

    sendDirection(direction: Direction) {
        logger.info(`Sending direction: ${direction}`);
        if (direction !== this.lastDirection && this.socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                type: "game-action",
                payload: {
                    gameId: this.gameStateManager.getGameId(),
                    index: this.gameStateManager.getPlayerIndex(),
                    action: direction,
                },
            });
            this.socket.send(message);
            this.lastDirection = direction;
        }
    }
    // --------------

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
        const rawGameState = JSON.parse(data.toString());
        const OLDstate = {
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

    closeConnection() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        }
    }
}
