import { err, ok, Result } from "neverthrow";
import { defaultGameConfig } from "./pong.config.ts";
import {
    Ball,
    UserInput,
    PongConfig,
    PongStatus,
    Paddle,
    PongEvent,
    PongState,
} from "./pong.types.ts";

// A single pong engine should handle all its own states
// Extract communication layer!! no ws stuff!! Don't care about players or ids or winners or whathaveyou
// Class because it's a very state dependent object
// It really shouldn't care whether it's local or remote, it should just be a pong game
export default class PongEngine {
    // Enforce 2 players for now
    private userInputs: [UserInput, UserInput]; // Here only handle up down and stop, who's handling key map to input action
    private paddles: [Paddle, Paddle]; // Enforce 2 players for now
    private scores: [number, number];
    private ball: Ball;
    private status: PongStatus;
    private events: PongEvent[]; // For playing sound on the frontend

    // Either local, or has two ws connections for two players, for now
    // Write in a way that it can be handled by multiple players more than 2,
    // If local, conns = empty array, no but it'll still have a websocket so won't be empty
    // Spectators?? NO
    // Collision event should be immediately broadcasted?
    constructor(private config: PongConfig = defaultGameConfig) {
        this.userInputs = ["stop", "stop"];
        this.scores = [0, 0];
        this.paddles = config.paddles;
        this.ball = config.ball;
        this.status = "ongoing";
        this.events = []; // why is this an array and not a flag?
    }

    //start() {
    //  this.status = "ongoing"; // Do we even need to wait??
    //}

    setInput(i: number, key: UserInput): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        this.userInputs[i] = key;
        return ok();
    }

    private addEvent(type: "paddle-collision" | "wall-collision" | "score"): Result<void, Error> {
        const event: PongEvent = {
            type,
            timestamp: Date.now(),
        };
        this.events.push(event);
        return ok();
    }

    tick(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        this.events = [];

        this.moveBall();
        this.userInputs.forEach((input, i) => this.movePaddle(i, input));
        this.detectCollisions();
        this.detectOutOfBounds();
        return ok();
    }

    // i -> index of paddle, 0 is left 1 right in twoplayers game
    private movePaddle(i: number, direction: UserInput): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const paddle = this.paddles[i];
        if (!paddle) {
            return err(new Error("Paddle not found"));
        }

        const { board } = this.config;
        const topLimit = board.depth / 2 - paddle.size.depth / 2;
        const bottomLimit = board.depth / 2 + paddle.size.depth / 2;
        if (direction === "up") {
            paddle.pos.z = Math.min(paddle.pos.z + paddle.speed, topLimit);
        } else if (direction === "down") {
            paddle.pos.z = Math.max(paddle.pos.z - paddle.speed, bottomLimit);
        }
        return ok();
    }

    moveBall(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        this.ball.pos.x += this.ball.vec.x;
        this.ball.pos.y += this.ball.vec.y;
        this.ball.pos.z += this.ball.vec.z;

        const { board } = this.config;
        const topLimit = board.depth / 2 - this.ball.r;
        const bottomLimit = -board.depth / 2 + this.ball.r;

        // Check collision with top and bottom walls
        if (this.ball.pos.z >= topLimit || this.ball.pos.z <= bottomLimit) {
            this.ball.vec.z = -this.ball.vec.z;
            this.addEvent("wall-collision");
        }
        return ok();
    }

    detectCollisions(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const { pos } = this.ball;
        const p = this.paddles;

        // TODO: Clean up this logic
        if (
            pos.x <= p[0].pos.x + p[0].size.width / 2 + this.ball.r &&
            pos.x >= p[0].pos.x - p[0].size.width / 2 - this.ball.r &&
            pos.z <= p[0].pos.z + p[0].size.depth / 2 + this.ball.r &&
            pos.z >= p[0].pos.z - p[0].size.depth / 2 - this.ball.r
        ) {
            this.ball.vec.x = -this.ball.vec.x;
            this.addEvent("paddle-collision");
        }

        if (
            pos.x >= p[1].pos.x - p[1].size.width / 2 - this.ball.r &&
            pos.x <= p[1].pos.x + p[1].size.width / 2 + this.ball.r &&
            pos.z <= p[1].pos.z + p[1].size.depth / 2 + this.ball.r &&
            pos.z >= p[1].pos.z - p[1].size.depth / 2 - this.ball.r
        ) {
            this.ball.vec.x = -this.ball.vec.x;
            this.addEvent("paddle-collision");
        }
        return ok();
    }

    detectOutOfBounds(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const { pos } = this.ball;
        const { board } = this.config;
        if (pos.x < -board.width / 2) {
            this.scores[1]++;
            this.checkWin();
            this.resetBall();
        } else if (pos.x > board.width / 2) {
            this.scores[0]++;
            this.checkWin();
            this.resetBall();
        }
        return ok();
    }

    resetBall(): Result<void, Error> {
        if (this.status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        this.ball.pos = { x: 0, y: 0, z: 0 };
        this.ball.vec = { x: 0, y: 0, z: 0 }; // Stop the ball temporarily

        // Probably should be handled by a config var
        setTimeout(() => {
            // Randomize ball direction
            const randomAngle = Math.random() * Math.PI * 2;
            this.ball.vec.x = this.ball.speed * Math.cos(randomAngle);
            this.ball.vec.z = this.ball.speed * Math.sin(randomAngle);

            // Check out why this adjument is needed
            if (Math.abs(this.ball.vec.x) < 0.3 * this.ball.speed) {
                this.ball.vec.x =
                    this.ball.vec.x > 0 ? 0.3 * this.ball.speed : -0.3 * this.config.ball.speed;
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

    serializeState(): Result<PongState, Error> {
        return ok({
            status: this.status,
            scores: this.scores,
            ball: this.ball,
            paddles: this.paddles,
            events: this.events,
        });
    }
}
