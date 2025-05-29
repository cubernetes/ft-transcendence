import chalk from "chalk";
import { EventEmitter } from "events";
import WebSocket from "ws";
import audioManager from "../audio/AudioManager";
import gameManager from "../game/GameManager";
import { getToken } from "../utils/auth";
import { PADDLE_SOUND, SCORE_SOUND, WALL_SOUND } from "../utils/config";

export class WebSocketManager extends EventEmitter {
    #socket: WebSocket;
    #openPromise: Promise<void>;
    active = false;

    constructor(serverUrl: string) {
        super();
        const jwtToken = getToken();
        if (!jwtToken) {
            throw new Error(
                chalk.red("No JWT token found. Cannot establish WebSocket connection.")
            );
        }
        this.#socket = new WebSocket(serverUrl, {
            headers: {
                cookie: `token=${jwtToken}`,
            },
        });
        this.#socket.binaryType = "arraybuffer";

        this.#openPromise = new Promise((resolve, reject) => {
            this.#socket.on("open", () => {
                resolve();
            });

            this.#socket.on("error", (err) => {
                console.error("Websocket error:", err);
                reject(err);
            });
        });

        this.#socket.on("message", this.onMessage.bind(this));
    }

    async sendGameStart(host: boolean) {
        try {
            await this.#openPromise;

            const jwtToken: string | null = getToken();
            if (!jwtToken) {
                console.log("JWT token not found.");
                return;
            }

            let message = JSON.stringify({
                type: "game-start",
            });
			if (host) {
				this.#socket.send(message);
			}
            console.log("Game start sent!");

            message = JSON.stringify({
                type: "renderer-ready",
            });
			this.#socket.send(message)
			console.log("Renderer ready sent");

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
                    // console.log("Starting game with payload:", message.payload);
			        // gameManager.updateRendererRes();
					gameManager.startRemoteGame(false);
                    break;
                case "game-end":
                    this.active = false;
                    gameManager.showRemoteWinner(message.payload);
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
                    break;
                case "ball-reset":
                    break;
                case "lobby-update":
                    gameManager.setRemoteConfig(message.payload);
                    this.emit("lobby-update", message.payload);
                    break;
                case "lobby-remove":
                    this.emit("lobby-remove");
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
