import readline from 'readline';
import { WebSocketManager } from './WebSocketManager';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

export class CLIControl {
    private webSocketManager: WebSocketManager;

    constructor(serverUrl: string) {
        this.webSocketManager = new WebSocketManager(serverUrl);

        rl.on('line', (input) => {
            if (input === 'w' || input === 'ArrowUp') {
                this.webSocketManager.sendDirection('move up');
            } else if (input === 's' || input === 'ArrowDown') {
                this.webSocketManager.sendDirection('move down');
            }
        });
    }
}
