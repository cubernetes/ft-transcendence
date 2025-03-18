import { Vec2D, Score, ICLIGameState } from './game.types';

export function renderGameState(state: ICLIGameState) {
	const { ball, paddle1, paddle2, score } = state;
	const width = 80;
	const height = 30;
	const paddleHeight = 6;
	
	// Clamp and round positions
	const clamp = (value: number, min: number, max: number) =>
		Math.max(min, Math.min(max, Math.round(value)));

	// Create empty field
	const field: string[][] = Array.from({ length: height }, () =>
		Array.from({ length: width }, () => ' ')
	);

	// Convert float positions to integers
    const ballX = clamp(Math.round(ball.x), 0, width - 1);
    const ballY = clamp(Math.round(ball.y), 0, height - 1);

    const pad1X = clamp(Math.round(paddle1.x), 0, width - 1);
    const pad1Y = clamp(Math.round(paddle1.y), 0, height - paddleHeight);

    const pad2X = clamp(Math.round(paddle2.x), 0, width - 1);
    const pad2Y = clamp(Math.round(paddle2.y), 0, height - paddleHeight);

	// Draw paddles
	for (let i = 0; i < paddleHeight; i++) {
		const y1 = clamp(pad1Y + i, 0, height - 1);
		const y2 = clamp(pad2Y + i, 0, height - 1);
		field[y1][pad1X] = '|';
		field[y2][pad2X] = '|';
	}

	// Draw ball
	field[ballY][ballX] = 'O';

	// Clear and print
	console.clear();
	console.log(`Score: Player 1 - ${score.player1} : ${score.player2} - Player 2`);
	
	const topBorder = '+' + '-'.repeat(width) + '+';
	console.log(topBorder);
	for (const row of field) {
		console.log('|' + row.join('') + '|');
	}
	console.log(topBorder);
}
