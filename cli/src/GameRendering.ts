import { Vec2D } from './game.types';

export interface Score {
	player1: number;
	player2: number;
}

export function renderGameState(
	ballPosition: Vec2D,
	paddlePosition1: Vec2D,
	paddlePosition2: Vec2D,
	score: Score
): void {
	const width = 100;
	const height = 60;
	const paddleHeight = 10;

	const field = Array.from({ length: height }, () => Array(width).fill(' '));

	// Clamp and round positions
	const clamp = (value: number, min: number, max: number) =>
		Math.max(min, Math.min(max, Math.round(value)));

	// Convert float positions to integers
    const ballX = clamp(Math.round(ballPosition.x), 0, width - 1);
    const ballY = clamp(Math.round(ballPosition.y), 0, height - 1);

    const pad1X = clamp(Math.round(paddlePosition1.x), 0, width - 1);
    const pad1Y = clamp(Math.round(paddlePosition1.y), 0, height - paddleHeight);

    const pad2X = clamp(Math.round(paddlePosition2.x), 0, width - 1);
    const pad2Y = clamp(Math.round(paddlePosition2.y), 0, height - paddleHeight);

	// Place paddles and ball
	field[pad1Y][pad1X] = '|';   // Player 1 paddle
	field[pad2Y][pad2X] = '|';   // Player 2 paddle
	field[ballY][ballX] = 'O';

	// Clear and print
	console.clear();
	console.log(`Score: Player 1 - ${score.player1} : ${score.player2} - Player 2`);
	field.forEach(row => console.log(row.join('')));
}
