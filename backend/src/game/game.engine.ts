import { GameState } from "./game.types";

export default class GameEngine {
    private playerInputs: Record<string, "up" | "down" | "stop"> = {
        "player-1": "stop",
        "player-2": "stop",
    };

    private ballVelocity: { x: number; y: number } = { x: 2, y: 2 };
    
    constructor(private state: GameState) {}
    
    setInput(playerKey: string, direction: "up" | "down" | "stop") {
        if (playerKey in this.playerInputs) {
            this.playerInputs[playerKey] = direction;
        }
    }

    update(): GameState {
        // Move ball, handle collisions, scoring...
        this.moveBall();
        this.movePaddles();
        this.detectCollisions();
        return this.state;
    }

    private movePaddles() {
        for (const playerKey of Object.keys(this.playerInputs)) {
            const input = this.playerInputs[playerKey];
            const paddle = this.state.paddlePosition[playerKey];
            if (!paddle) continue;

            if (input === "up") {
                paddle.y = Math.max(0, paddle.y - 3);
            } else if (input === "down") {
                paddle.y = Math.min(250, paddle.y + 3);
            }
        }
    }

    private moveBall() {
        this.state.ballPosition.x += this.ballVelocity.x;
        this.state.ballPosition.y += this.ballVelocity.y;

        // Bounce on the left and right edges (adjust as needed for your field size)
        if (this.state.ballPosition.x <= 0 || this.state.ballPosition.x >= 690) {
            this.ballVelocity.x = -this.ballVelocity.x; // Reverse direction on hit
        }
        // Bounce on the up and down edges (adjust as needed for your field size)
        if (this.state.ballPosition.y <= 0 || this.state.ballPosition.y >= 300) {
            this.ballVelocity.y = -this.ballVelocity.y; // Reverse direction on hit
        }
    }

    private detectCollisions() {
        // Implement logic for detecting collisions with paddles
        const ball = this.state.ballPosition;
        const player1Paddle = this.state.paddlePosition["player-1"];
        const player2Paddle = this.state.paddlePosition["player-2"];

        // Check for paddle collisions (simple version)
        if (ball.x <= 20 && ball.x >= 10 && ball.y >= player1Paddle.y && ball.y <= player1Paddle.y + 80) {
            this.ballVelocity.x = -this.ballVelocity.x; // Ball hits player 1's paddle
        }
        if (ball.x >= 780 && ball.x <= 790 && ball.y >= player2Paddle.y && ball.y <= player2Paddle.y + 80) {
            this.ballVelocity.x = -this.ballVelocity.x; // Ball hits player 2's paddle
        }
    }
}
