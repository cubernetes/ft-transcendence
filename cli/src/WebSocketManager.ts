import { ICLIGameState, IServerGameState } from './game.types';
import WebSocket from 'ws';
import { renderGameState } from './GameRendering';
import { vec3ToVec2D } from './utils';

export class WebSocketManager {
    private ws: WebSocket;

    constructor(private serverUrl: string) {
        this.ws = new WebSocket(this.serverUrl);
        
        // WebSocket connection open
        this.ws.on('open', () => {
            console.log("Connected to the server");
        });

        // Handle incoming messages from the server
        this.ws.on('message', this.onMessage.bind(this));
    }

    // Method to send a direction change to the server
    sendDirection(direction: string) {
        console.log(`[SEND] ${direction}`);
        this.ws.send(direction);
    }

    // Handle the server's game state updates
    onMessage(data: WebSocket.Data) {
        const rawGameState: IServerGameState = JSON.parse(data.toString());
        const cliGameState: ICLIGameState = {
            ball: vec3ToVec2D(rawGameState.ballPosition),
            paddle1: vec3ToVec2D(rawGameState.paddlePosition["player-1"]),
            paddle2: vec3ToVec2D(rawGameState.paddlePosition["player-2"]),
            score: rawGameState.score,
            gameRunning: true,
            lastCollisionEvents: rawGameState.collisionEvents
        };
        renderGameState(cliGameState);
    }
}
