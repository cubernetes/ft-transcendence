import { GameState } from "./game.type.ts";

const BOARD_DEPTH = 15;
const PADDLE_WIDTH = 0.2;
const PADDLE_DEPTH = 5;
const PADDLE_SPEED = 0.3;
const BALL_RADIUS = 0.3;
const BALL_SPEED = 0.2;
const BOARD_WIDTH = 20;

export default class GameEngine {
    private playerInputs: Record<string, "up" | "down" | "stop"> = {
        "player-1": "stop",
        "player-2": "stop",
    };

    private ballDirection: { x: number; y: number; z: number } = {
        x: BALL_SPEED,
        y: 0,
        z: BALL_SPEED,
    };

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
        this.detectOutOfBounds();
        return this.state;
    }

    private movePaddles() {
        for (const playerKey of Object.keys(this.playerInputs)) {
            const input = this.playerInputs[playerKey];
            const paddle = this.state.paddlePosition[playerKey];
            if (!paddle) continue;

            if (input === "up") {
                paddle.z += PADDLE_SPEED;
                if (paddle.z > BOARD_DEPTH / 2 - PADDLE_DEPTH / 2) {
                    paddle.z = BOARD_DEPTH / 2 - PADDLE_DEPTH / 2;
                }
            } else if (input === "down") {
                paddle.z -= PADDLE_SPEED;
                if (paddle.z < -BOARD_DEPTH / 2 + PADDLE_DEPTH / 2) {
                    paddle.z = -BOARD_DEPTH / 2 + PADDLE_DEPTH / 2;
                }
            }
        }
    }

    private moveBall() {
        this.state.ballPosition.x += this.ballDirection.x;
        this.state.ballPosition.y += this.ballDirection.y;

        // Ball collision with top and bottom walls
        if (
            this.state.ballPosition.z >= BOARD_DEPTH / 2 - BALL_RADIUS ||
            this.state.ballPosition.z <= -BOARD_DEPTH / 2 + BALL_RADIUS
        ) {
            this.ballDirection.z = -this.ballDirection.z; // Reverse z direction
        }
    }

    private detectCollisions() {
        // Implement logic for detecting collisions with paddles
        const ball = this.state.ballPosition;
        const player1Paddle = this.state.paddlePosition["player-1"];
        const player2Paddle = this.state.paddlePosition["player-2"];
        if (
            ball.x <= player1Paddle.x + PADDLE_WIDTH / 2 + BALL_RADIUS &&
            ball.x >= player1Paddle.x - PADDLE_WIDTH / 2 - BALL_RADIUS &&
            ball.z <= player1Paddle.z + PADDLE_DEPTH / 2 + BALL_RADIUS &&
            ball.z >= player1Paddle.z - PADDLE_DEPTH / 2 - BALL_RADIUS
        ) {
            this.ballDirection.x = Math.abs(this.ballDirection.x); // Reverse x direction
        }
        if (
            ball.x >= player2Paddle.x - PADDLE_WIDTH / 2 - BALL_RADIUS &&
            ball.x <= player2Paddle.x + PADDLE_WIDTH / 2 + BALL_RADIUS &&
            ball.z <= player2Paddle.z + PADDLE_DEPTH / 2 + BALL_RADIUS &&
            ball.z >= player2Paddle.z - PADDLE_DEPTH / 2 - BALL_RADIUS
        ) {
            this.ballDirection.x = -Math.abs(this.ballDirection.x); // Reverse x direction
        }
    }

    private detectOutOfBounds() {
        const ball = this.state.ballPosition;
        if (ball.x < -BOARD_WIDTH / 2) {
            //Player 2 scores
            this.state.score.player2++;
            this.resetBall();
        } else if (ball.x > BOARD_WIDTH / 2) {
            // Player 1 scores
            this.state.score.player1++;
            this.resetBall();
        }
    }

    private resetBall() {
        // Reset ball position immediately
        this.state.ballPosition = { x: 0, y: 0, z: 0 };
        // Stop the ball temporarily
        this.ballDirection = { x: 0, y: 0, z: 0 };

        setTimeout(() => {
            // Randomize ball direction
            const randomAngle = Math.random() * Math.PI * 2;
            this.ballDirection.x = BALL_SPEED * Math.cos(randomAngle);
            this.ballDirection.z = BALL_SPEED * Math.sin(randomAngle);

            if (Math.abs(this.ballDirection.x) < 0.3 * BALL_SPEED) {
                this.ballDirection.x =
                    this.ballDirection.x > 0 ? 0.3 * BALL_SPEED : -0.3 * BALL_SPEED;
            }
        }, 1500);
    }
}
