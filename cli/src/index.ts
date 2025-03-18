import { WebSocketManager } from './WebSocketManager';
import { startKeyListener } from './input';

const serverUrl = 'ws://localhost:8080/ws';
const wsManager = new WebSocketManager(serverUrl);

startKeyListener((dir) => {
	wsManager.sendDirection(`move ${dir}`); // "move up", etc.
});

console.log("Pong CLI Game Started!");
console.log("Use 'w' and 's' to move the paddle up and down. Arrow keys work too.");
