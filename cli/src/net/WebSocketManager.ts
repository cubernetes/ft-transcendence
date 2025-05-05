import WebSocket from "ws";
import audioManager from "../audio/AudioManager";
import gameManager from "../game/GameManager";
import { getToken } from "../utils/auth";
import { PADDLE_SOUND, SCORE_SOUND, WALL_SOUND } from "../utils/config";

export class WebSocketManager {
    #socket: WebSocket;
    #openPromise: Promise<void>;
    active = true;

    constructor(serverUrl: string) {
        this.#socket = new WebSocket(serverUrl);

        this.#openPromise = new Promise((resolve, reject) => {
            this.#socket.on("open", () => {
                console.log("Connected to the server");
                resolve();
            });

            this.#socket.on("error", (err) => {
                console.error("Websocket error:", err);
                reject(err);
            });
        });

        this.#socket.on("message", this.onMessage.bind(this));
    }

    async sendGameStart() {
        console.log("in function sendGameStart");
        try {
            await this.#openPromise;
            console.log("Sending game-start");

            const jwtToken: string | null = getToken();
            if (!jwtToken) {
                console.log("JWT token not found.");
                return;
            }

            console.log("JWT token:", jwtToken);

            const message = JSON.stringify({
                type: "game-start",
                payload: { token: jwtToken },
            });
            this.#socket.send(message);
            console.log("Game start sent!");
        } catch (error) {
            console.error("Error sending game start: ", error);
        }
    }

    /**
     * Sends a message to the server.
     * @param {string} response - The message to send.
     */
    sendMessage(response: string) {
        this.#socket.send(response);
    }

    /**
     * Handles incoming messages from the server.
     * @param {WebSocket.Data} event - The incoming message -> event.
     */
    onMessage(event: WebSocket.Data) {
        if (!this.active) {
            return;
        }

        try {
            const message = JSON.parse(event.toString());

            if (!message.type) {
                console.warn("Received WebSocket message without a type:", message);
                return;
            }

            switch (message.type) {
                case "game-start":
                    console.log("Starting game with payload:", message.payload);
                    gameManager.setRemoteGame(
                        message.payload.gameId,
                        message.payload.opponentId,
                        message.payload.index
                    );
                    break;
                case "game-end":
                    gameManager.showRemoteWinner(message.payload.winner);
                    break;
                case "score-update":
                    audioManager.playSoundEffect(SCORE_SOUND);
                    break;
                case "wall-collision":
                    audioManager.playSoundEffect(WALL_SOUND);
                    break;
                case "paddle-collision":
                    audioManager.playSoundEffect(PADDLE_SOUND);
                    break;
                case "state-update":
                    gameManager.renderRemoteState(message.payload.state);
                    break;
                case "waiting-for-opponent":
                    console.log("Waiting for opponent...");
                    break;
                case "ball-reset":
                    console.log("Resetting ball");
                    break;
                default:
                    console.warn("Unknown WebSocket event type:", message.type);
                    break;
            }
        } catch (error) {
            console.error("Error parsing WebSocket message:", error, event.toString());
        }
    }

    closeConnection() {
        if (this.#socket && this.#socket.readyState === WebSocket.OPEN) {
            this.#socket.close();
        }
    }
}
