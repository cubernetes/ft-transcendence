import { WebSocketManager } from './WebSocketManager';
import { startKeyListener } from './input';
import { setGameConfig } from './GameRendering';
import { GameConfig } from './game.types';

async function fetchGameConfig(): Promise<GameConfig> {
	const res = await fetch('http://localhost:8080/api/games/config');
	if (!res.ok) {
		throw new Error(`Failed to fetch config: ${res.status}`);
	}
	return res.json();
}

async function startClient() {
	try {
		const config = await fetchGameConfig();
		console.log("Fetched game config:", config);

		setGameConfig(config);

		const serverUrl = 'ws://localhost:8080/ws';
		const wsManager = new WebSocketManager(serverUrl);

		startKeyListener((dir) => {
			console.log(`Direction: ${dir}`);
			wsManager.sendDirection(`move ${dir}`);
		});

		console.log("Pong CLI Game Started!");
		console.log("Use 'w' and 's' to move the paddle up and down. Arrow keys work too.");
	} catch (err) {
		console.error("Startup failed:", err);
		process.exit(1);
	}
}

startClient();

// Fetched game config: {
// 	BOARD_WIDTH: 20,
// 	BOARD_HEIGHT: 0.1,
// 	BOARD_DEPTH: 15,
// 	PADDLE_WIDTH: 0.2,
// 	PADDLE_HEIGHT: 0.3,
// 	PADDLE_DEPTH: 5,
// 	BALL_RADIUS: 0.3,
// 	PADDLE_SPEED: 0.3,
// 	BALL_SPEED: 0.2
// }
  