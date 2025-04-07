import { logger } from "../../../utils/logger";
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
            try {
                const message = JSON.parse(event.data); // Parse incoming message

                if (!message.type) {
                    logger.warn("Received WebSocket message without a type:", message);
                    return;
                }
                // logger.info("Received WebSocket message:", message);
                console.log("Received WebSocket message:", message);

                switch (message.type) {
                    case "game-start":
                        this.gameStateManager.startGame(message.payload);
                        break;

                    case "game-end":
                        this.gameStateManager.endGame(message.payload.winner);
                        break;

                    case "score":
                        this.gameStateManager.updateScore(message.payload.scores);
                        break;

                    case "wall-collision":
                        this.gameStateManager.handleWallCollision();
                        break;

                    case "paddle-collision":
                        this.gameStateManager.handlePaddleCollision();
                        break;

                    case "state-update":
                        this.gameStateManager.updateGameObjects(message.payload);
                        break;

                    case "waiting-for-opponent":
                        logger.info("Waiting for opponent...");
                        break;

                    case "ball-reset":
                        this.gameStateManager.resetBall();
                        break;

                    default:
                        logger.warn("Unknown WebSocket event type:", message.type);
                }
            } catch (error) {
                logger.error("Error parsing WebSocket message:", error, event.data);
            }
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
}
