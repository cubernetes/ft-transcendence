import { GameState, GameConfig, CollisionEvent } from "./game.types.ts";

export const GAME_CONSTANTS: GameConfig = {
    BOARD_WIDTH: 40,
    BOARD_HEIGHT: 0.1,
    BOARD_DEPTH: 30,
    PADDLE_WIDTH: 0.2,
    PADDLE_HEIGHT: 0.3,
    PADDLE_DEPTH: 25,
    BALL_RADIUS: 0.3,
    PADDLE_SPEED: 0.3,
    BALL_SPEED: 0.3,
};

export default class GameEngine {
    private playerInputs: Record<string, "up" | "down" | "stop"> = {
        "player-1": "stop",
        "player-2": "stop",
    };

    private ballDirection: { x: number; y: number; z: number } = {
        x: GAME_CONSTANTS.BALL_SPEED,
        y: 0,
        z: GAME_CONSTANTS.BALL_SPEED,
    };

    constructor(private state: GameState) {
        // Initialize collision events array
        this.state.collisionEvents = [];
    }

    setInput(playerKey: string, direction: "up" | "down" | "stop") {
        if (playerKey in this.playerInputs) {
            this.playerInputs[playerKey] = direction;
        }
    }

    update(): GameState {
        // Clear previous collision events
        this.state.collisionEvents = [];

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
                paddle.z += GAME_CONSTANTS.PADDLE_SPEED;
                if (paddle.z > GAME_CONSTANTS.BOARD_DEPTH / 2 - GAME_CONSTANTS.PADDLE_DEPTH / 2) {
                    paddle.z = GAME_CONSTANTS.BOARD_DEPTH / 2 - GAME_CONSTANTS.PADDLE_DEPTH / 2;
                }
            } else if (input === "down") {
                paddle.z -= GAME_CONSTANTS.PADDLE_SPEED;
                if (paddle.z < -GAME_CONSTANTS.BOARD_DEPTH / 2 + GAME_CONSTANTS.PADDLE_DEPTH / 2) {
                    paddle.z = -GAME_CONSTANTS.BOARD_DEPTH / 2 + GAME_CONSTANTS.PADDLE_DEPTH / 2;
                }
            }
        }
    }

    private moveBall() {
        this.state.ballPosition.x += this.ballDirection.x;
        this.state.ballPosition.y += this.ballDirection.y;
        this.state.ballPosition.z += this.ballDirection.z;

        // Ball collision with top and bottom walls
        if (
            this.state.ballPosition.z >=
                GAME_CONSTANTS.BOARD_DEPTH / 2 - GAME_CONSTANTS.BALL_RADIUS ||
            this.state.ballPosition.z <=
                -GAME_CONSTANTS.BOARD_DEPTH / 2 + GAME_CONSTANTS.BALL_RADIUS
        ) {
            this.ballDirection.z = -this.ballDirection.z; // Reverse z direction

            // Add wall collision event
            this.addCollisionEvent("wall");
        }
    }

    private detectCollisions() {
        // Implement logic for detecting collisions with paddles
        const ball = this.state.ballPosition;
        const player1Paddle = this.state.paddlePosition["player-1"];
        const player2Paddle = this.state.paddlePosition["player-2"];

        // Check collision with player 1 paddle
        if (
            ball.x <=
                player1Paddle.x + GAME_CONSTANTS.PADDLE_WIDTH / 2 + GAME_CONSTANTS.BALL_RADIUS &&
            ball.x >=
                player1Paddle.x - GAME_CONSTANTS.PADDLE_WIDTH / 2 - GAME_CONSTANTS.BALL_RADIUS &&
            ball.z <=
                player1Paddle.z + GAME_CONSTANTS.PADDLE_DEPTH / 2 + GAME_CONSTANTS.BALL_RADIUS &&
            ball.z >= player1Paddle.z - GAME_CONSTANTS.PADDLE_DEPTH / 2 - GAME_CONSTANTS.BALL_RADIUS
        ) {
            this.ballDirection.x = Math.abs(this.ballDirection.x); // Reverse x direction
            this.addCollisionEvent("paddle");
        }

        // Check collision with player 2 paddle
        if (
            ball.x >=
                player2Paddle.x - GAME_CONSTANTS.PADDLE_WIDTH / 2 - GAME_CONSTANTS.BALL_RADIUS &&
            ball.x <=
                player2Paddle.x + GAME_CONSTANTS.PADDLE_WIDTH / 2 + GAME_CONSTANTS.BALL_RADIUS &&
            ball.z <=
                player2Paddle.z + GAME_CONSTANTS.PADDLE_DEPTH / 2 + GAME_CONSTANTS.BALL_RADIUS &&
            ball.z >= player2Paddle.z - GAME_CONSTANTS.PADDLE_DEPTH / 2 - GAME_CONSTANTS.BALL_RADIUS
        ) {
            this.ballDirection.x = -Math.abs(this.ballDirection.x); // Reverse x direction
            this.addCollisionEvent("paddle");
        }
    }

    private detectOutOfBounds() {
        const ball = this.state.ballPosition;
        if (ball.x < -GAME_CONSTANTS.BOARD_WIDTH / 2) {
            //Player 2 scores
            this.state.score.player2++;
            this.addCollisionEvent("score");
            this.resetBall();
        } else if (ball.x > GAME_CONSTANTS.BOARD_WIDTH / 2) {
            // Player 1 scores
            this.state.score.player1++;
            this.addCollisionEvent("score");
            this.resetBall();
        }
    }

    private addCollisionEvent(type: "paddle" | "wall" | "score") {
        const event: CollisionEvent = {
            type,
            timestamp: Date.now(),
        };
        this.state.collisionEvents!.push(event);
    }

    private resetBall() {
        // Reset ball position immediately
        this.state.ballPosition = { x: 0, y: 0, z: 0 };
        // Stop the ball temporarily
        this.ballDirection = { x: 0, y: 0, z: 0 };

        setTimeout(() => {
            // Randomize ball direction
            const randomAngle = Math.random() * Math.PI * 2;
            this.ballDirection.x = GAME_CONSTANTS.BALL_SPEED * Math.cos(randomAngle);
            this.ballDirection.z = GAME_CONSTANTS.BALL_SPEED * Math.sin(randomAngle);

            if (Math.abs(this.ballDirection.x) < 0.3 * GAME_CONSTANTS.BALL_SPEED) {
                this.ballDirection.x =
                    this.ballDirection.x > 0
                        ? 0.3 * GAME_CONSTANTS.BALL_SPEED
                        : -0.3 * GAME_CONSTANTS.BALL_SPEED;
            }
        }, 1500);
    }
}
