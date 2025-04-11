import { resolve } from "path";
import WebSocket from "ws";
import audioManager from "../audio/AudioManager";
import gameManager from "../game/GameManager";
import { getToken } from "../menu/auth";
import { mainMenu } from "../menu/mainMenu";
import { PADDLE_SOUND, SCORE_SOUND, WALL_SOUND } from "../utils/config";

export class WebSocketManager {
    private socket: WebSocket;
    private openPromise: Promise<void>;

    constructor(private serverUrl: string) {
        this.socket = new WebSocket(this.serverUrl);

        this.openPromise = new Promise((resolve, reject) => {
            this.socket.on("open", () => {
                console.log("Connected to the server");
                resolve();
            });

            this.socket.on("error", (err) => {
                console.error("Websocket error:", err);
                reject(err);
            });
        });

        // Handle incoming messages from the server
        this.socket.on("message", this.onMessage.bind(this));
    }

    // -------------- copied from frontend
    async sendGameStart() {
        console.log("in function sendGameStart");
        try {
            await this.openPromise;
            console.log("Sending game-start");

            const jwtToken: string | null = getToken();
            if (!jwtToken) {
                console.log("JWT token not found.");
                return;
            }

            console.log("JWT token:", jwtToken);

            const message = JSON.stringify({
                type: "game-start",
                payload: {
                    token: jwtToken,
                },
            });
            this.socket.send(message);
            console.log("Game start sent!");
        } catch (error) {
            console.error("Error sending game start: ", error);
        }
    }

    // --------------

    // Method to send data to the server
    sendMessage(response: string) {
        this.socket.send(response);
    }

    onMessage(event: WebSocket.Data) {
        try {
            const message = JSON.parse(event.toString());

            // Ensure message has a type
            if (!message.type) {
                console.warn("Received WebSocket message without a type:", message);
                return;
            }

            // console.log("Received WebSocket message:", message);

            switch (message.type) {
                case "game-start":
                    console.log("Starting game with payload:", message.payload);
                    // Handle game start logic here, possibly calling gameStateManager.startGame
                    break;

                case "game-end":
                    gameManager.showRemoteWinner(message.payload.winner);
                    break;

                case "score":
                    audioManager.playSoundEffect(SCORE_SOUND);
                    break;

                case "wall-collision":
                    audioManager.playSoundEffect(WALL_SOUND);
                    break;

                case "paddle-collision":
                    audioManager.playSoundEffect(PADDLE_SOUND);
                    break;

                case "state-update":
                    gameManager.renderRemoteState(message.payload);
                    break;

                case "waiting-for-opponent":
                    console.log("Waiting for opponent...");
                    // Handle waiting logic
                    break;

                case "ball-reset":
                    console.log("Resetting ball");
                    // Handle ball reset logic
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
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
    }
}
