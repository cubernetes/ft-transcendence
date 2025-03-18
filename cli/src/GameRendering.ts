import { Vec2D, ICLIGameState, GameConfig } from './game.types';

let GAME_CONFIG: GameConfig | null = null;

export function setGameConfig(config: GameConfig) {
	GAME_CONFIG = config;
}

export function renderGameState(state: ICLIGameState) {
	if (!GAME_CONFIG) {
		throw new Error("Game config not set. Call setGameConfig() before rendering.");
	}
	const { ball, paddle1, paddle2, score } = state;
	const config = GAME_CONFIG;

	// Terminal dimensions (characters)
	const TERM_WIDTH = 160;
	const TERM_HEIGHT = 40;

	// Projection factors
	const scaleX = TERM_WIDTH / config.BOARD_WIDTH;
	const scaleY = TERM_HEIGHT / config.BOARD_DEPTH;

	// Project world coordinates to terminal grid
	const project = (v: Vec2D): { x: number; y: number } => ({
		x: Math.min(TERM_WIDTH - 1, Math.max(0, Math.round(v.x * scaleX + TERM_WIDTH / 2))),
		y: Math.min(TERM_HEIGHT - 1, Math.max(0, Math.round(v.y * scaleY + TERM_HEIGHT / 2))),
	});

	const ballPos = project(ball);
	const pad1Pos = project(paddle1);
	const pad2Pos = project(paddle2);

	const paddleHeight = Math.max(1, Math.round(config.PADDLE_DEPTH * scaleY));

	// Empty field
	const field: string[][] = Array.from({ length: TERM_HEIGHT }, () =>
		Array.from({ length: TERM_WIDTH }, () => ' ')
	);

	// Draw paddles
	for (let i = 0; i < paddleHeight; i++) {
		const y1 = Math.min(TERM_HEIGHT - 1, pad1Pos.y + i - Math.floor(paddleHeight / 2));
		const y2 = Math.min(TERM_HEIGHT - 1, pad2Pos.y + i - Math.floor(paddleHeight / 2));
		field[y1][pad1Pos.x] = '|';
		field[y2][pad2Pos.x] = '|';
	}

	// Draw ball
	field[ballPos.y][ballPos.x] = 'O';

	// Clear and print
	console.clear();
	console.log(`Score: Player 1 - ${score.player1} : ${score.player2} - Player 2`);
	
	const border = '+' + '-'.repeat(TERM_WIDTH) + '+';
	console.log(border);
	for (const row of field) {
		console.log('|' + row.join('') + '|');
	}
	console.log(border);
}
