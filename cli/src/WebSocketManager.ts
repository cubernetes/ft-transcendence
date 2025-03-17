import WebSocket from 'ws';
import { renderGameState } from './GameRendering';

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
        const message = JSON.stringify({ type: 'move', direction });
        this.ws.send(message);
    }

    // Handle the server's game state updates
    onMessage(data: WebSocket.Data) {
        const gameState = JSON.parse(data.toString());
        this.updateGameState(gameState);
    }

    // Method to update the game state in the CLI
    updateGameState(gameState: any) {
        const ballPosition = gameState.ballPosition;
        const paddlePosition1 = gameState.paddlePosition["player-1"];
        const paddlePosition2 = gameState.paddlePosition["player-2"];
        const score = gameState.score;

        // Call function to render game state to CLI
        renderGameState(ballPosition, paddlePosition1, paddlePosition2, score);
    }
}
