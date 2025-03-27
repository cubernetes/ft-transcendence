import { err, ok, Result } from "neverthrow";
import { defaultGameConfig } from "./pong.config.ts";
import { Ball, UserInput, PongConfig, Position3D, PongType, PongStatus } from "./pong.types.ts";

// A single pong engine should handle all its own states
// Extract communication layer!! no ws stuff!! Don't care about players or ids or winners or whathaveyou
export default class PongEngine {
    type: PongType;
    config: PongConfig;
    paddles: Position3D[];
    scores: number[];
    ball: Ball;
    status: PongStatus;

    // Either local, or has two ws connections for two players, for now
    // Write in a way that it can be handled by multiple players more than 2,
    // If local, conns = empty array, no but it'll still have a websocket so won't be empty
    // Spectators?? NO
    // Collision event should be immediately broadcasted?
    constructor(type: PongType, config: PongConfig = defaultGameConfig) {
        this.type = type;
        // Potentially guard mistyped games, check # of ws?
        this.config = config;
        this.scores = [0, 0];
        this.paddles = [
            // 0.5 are the paddings? should let it be set somewhere else potentially
            { x: -config.boardWidth / 2 + 0.5, y: 0.5, z: 0 },
            { x: config.boardWidth / 2 - 0.5, y: 0.5, z: 0 },
        ];
        this.ball = {
            pos: { x: 0, y: 0, z: 0 },
            v: { x: config.ballSpeed, y: 0, z: config.ballSpeed },
        };
        this.status = "waiting";
    }

    start() {
        this.status = "ongoing";
    }

    // key = "up" | "down" | "w" | "s", maybe pause also for local or something
    // Customize key map
    setInput(i: number, key: string): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        if (this.type === "remote") {
            if (key !== "up" && key !== "down" && key !== "stop") {
                return err(new Error("Invalid key for remote player"));
            }
            this.movePaddle(i, key);
        }

        // Local
        // Stop issue... is it really needed??
        if (key === "w") {
            this.movePaddle(0, "up");
        }
        if (key === "s") {
            this.movePaddle(0, "down");
        }
        if (key === "up" || key === "down") {
            this.movePaddle(1, key);
        }
        return ok();
    }

    update(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        this.moveBall();
        return ok();
    }

    // i -> index of paddle, 0 is left 1 right in twoplayers game
    movePaddle(i: number, direction: UserInput): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const paddle = this.paddles[i];
        if (!paddle) return err(new Error("Paddle not found"));

        const topLimit = this.config.boardDepth / 2 - this.config.paddleDepth / 2;
        const bottomLimit = -this.config.boardDepth / 2 + this.config.paddleDepth / 2;
        if (direction === "up") {
            paddle.z = Math.min(paddle.z + this.config.paddleSpeed, topLimit);
        } else if (direction === "down") {
            paddle.z = Math.max(paddle.z - this.config.paddleSpeed, bottomLimit);
        }
        return ok();
    }

    moveBall(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        this.ball.pos.x += this.ball.v.x;
        this.ball.pos.y += this.ball.v.y;
        this.ball.pos.z += this.ball.v.z;

        const topLimit = this.config.boardDepth / 2 - this.config.ballRadius;
        const bottomLimit = -this.config.boardDepth / 2 + this.config.ballRadius;

        // Check collision with top and bottom walls
        if (this.ball.pos.z >= topLimit || this.ball.pos.z <= bottomLimit) {
            this.ball.v.z = -this.ball.v.z;
        }
        return ok();
    }

    detectCollisions(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const { pos } = this.ball;
        const p = this.paddles;
        const w = this.config.paddleWidth;
        const r = this.config.ballRadius;

        // TODO: Clean up this logic
        if (
            pos.x <= p[0].x + w / 2 + r &&
            pos.x >= p[0].x - w / 2 - r &&
            pos.z <= p[0].z + w / 2 + r &&
            pos.z >= p[0].z - w / 2 - r
        ) {
            this.ball.v.x = -this.ball.v.x;
        }

        if (
            pos.x >= p[1].x - w / 2 - r &&
            pos.x >= p[1].x + w / 2 + r &&
            pos.z <= p[1].z + w / 2 + r &&
            pos.z >= p[1].z - w / 2 - r
        ) {
            this.ball.v.x = -this.ball.v.x;
        }
        return ok();
    }

    detectOutOfBounds(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const { pos } = this.ball;
        if (pos.x < -this.config.boardWidth / 2) {
            this.scores[1]++;
            this.resetBall();
        } else if (pos.x > this.config.boardWidth / 2) {
            this.scores[0]++;
            this.resetBall();
        }
        return ok();
    }

    resetBall(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        this.ball.pos = { x: 0, y: 0, z: 0 };
        this.ball.v = { x: 0, y: 0, z: 0 }; // Stop the ball temporarily

        // Probably should be handled by a config var
        setTimeout(() => {
            // Randomize ball direction
            const randomAngle = Math.random() * Math.PI * 2;
            this.ball.v.x = this.config.ballSpeed * Math.cos(randomAngle);
            this.ball.v.z = this.config.ballSpeed * Math.sin(randomAngle);

            // Check out why this adjument is needed
            if (Math.abs(this.ball.v.x) < 0.3 * this.config.ballSpeed) {
                this.ball.v.x =
                    this.ball.v.x > 0 ? 0.3 * this.config.ballSpeed : -0.3 * this.config.ballSpeed;
            }
        }, 1500);
        return ok();
    }

    checkWin(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        if (this.scores.some((n) => n >= this.config.playTo)) {
            this.status = "ended";
        }

        return ok();
    }
}
