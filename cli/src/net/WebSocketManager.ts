import WebSocket from "ws";
import { getToken } from "../menu/auth";
import { mainMenu } from "../menu/mainMenu";

export class WebSocketManager {
    private socket: WebSocket;

    constructor(private serverUrl: string) {
        this.socket = new WebSocket(this.serverUrl);

        this.socket.on("open", () => {
            console.log("Connected to the server");
        });

        // Handle incoming messages from the server
        this.socket.on("message", this.onMessage.bind(this));
    }

    // -------------- copied from frontend
    sendGameStart() {
        console.log("in function sendGameStart");
        if (this.socket.readyState === WebSocket.OPEN) {
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
            console.log("Game start message sent:", message);
        } else {
            console.log("WebSocket is not open.");
        }
    }

    // --------------

    // Method to send data to the server
    sendMessage(response: string) {
        // console.log(`[SEND] ${response}`);
        this.socket.send(response);
    }

    // Handle the server's game state updates
    onMessage(data: WebSocket.Data) {
        // const rawGameState = JSON.parse(data.toString());
        // const OLDstate = {
        //     ball: vec3ToVec2D(rawGameState.ballPosition),
        //     paddle1: vec3ToVec2D(rawGameState.paddlePosition["player-1"]),
        //     paddle2: vec3ToVec2D(rawGameState.paddlePosition["player-2"]),
        //     score: rawGameState.score,
        //     gameRunning: true,
        //     lastCollisionEvents: rawGameState.collisionEvents,
        // };
        // renderGameState(cliGameState);
    }

    closeConnection() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
    }
}
