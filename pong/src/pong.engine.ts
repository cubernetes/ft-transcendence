import { Result, err, ok } from "neverthrow";
import { defaultGameConfig } from "./pong.config";
import {
    Ball,
    EventCallback,
    Paddle,
    PongConfig,
    PongEngineEvent,
    PongState,
    PongStatus,
    UserInput,
} from "./pong.types";

// Enforce 2 players for now
export const createPongEngine = (config: PongConfig = defaultGameConfig) => {
    const listeners: Map<PongEngineEvent["type"], EventCallback[]> = new Map();
    const userInputs: [UserInput, UserInput] = ["stop", "stop"];
    const scores: [number, number] = [0, 0];
    const paddles: [Paddle, Paddle] = config.paddles;
    const ball: Ball = config.ball;
    const tickRate = 1000 / config.fps;
    let interval: ReturnType<typeof setInterval> | null = null;
    let status: PongStatus = "waiting";

    const emit = (event: PongEngineEvent) => {
        const eventListeners = listeners.get(event.type);
        if (eventListeners) {
            eventListeners.forEach((cb) => cb(event));
        }
    };

    const onEvent = (type: PongEngineEvent["type"], cb: EventCallback) => {
        if (!listeners.has(type)) {
            listeners.set(type, []);
        }
        listeners.get(type)!.push(cb);
    };

    const movePaddle = (i: number, direction: UserInput): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const paddle = paddles[i];
        if (!paddle) {
            return err(new Error("Paddle not found"));
        }

        const { board } = config;
        const topLimit = board.size.depth / 2 - paddle.size.depth / 2;
        const bottomLimit = board.size.depth / 2 + paddle.size.depth / 2;
        if (direction === "up") {
            paddle.pos.z = Math.min(paddle.pos.z + paddle.speed, topLimit);
        } else if (direction === "down") {
            paddle.pos.z = Math.max(paddle.pos.z - paddle.speed, bottomLimit);
        }
        return ok();
    };

    const moveBall = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        ball.pos.x += ball.vec.x;
        ball.pos.y += ball.vec.y;
        ball.pos.z += ball.vec.z;

        const { board } = config;
        const topLimit = board.size.depth / 2 - ball.r;
        const bottomLimit = -board.size.depth / 2 + ball.r;

        // Check collision with top and bottom walls
        if (ball.pos.z >= topLimit || ball.pos.z <= bottomLimit) {
            ball.vec.z = -ball.vec.z;
            emit({ type: "wall-collision" });
        }
        return ok();
    };

    const detectCollisions = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const { pos } = ball;
        const p = paddles;

        // TODO: Clean up this logic
        if (
            pos.x <= p[0].pos.x + p[0].size.width / 2 + ball.r &&
            pos.x >= p[0].pos.x - p[0].size.width / 2 - ball.r &&
            pos.z <= p[0].pos.z + p[0].size.depth / 2 + ball.r &&
            pos.z >= p[0].pos.z - p[0].size.depth / 2 - ball.r
        ) {
            ball.vec.x = -ball.vec.x;
            emit({ type: "paddle-collision" });
        }

        if (
            pos.x >= p[1].pos.x - p[1].size.width / 2 - ball.r &&
            pos.x <= p[1].pos.x + p[1].size.width / 2 + ball.r &&
            pos.z <= p[1].pos.z + p[1].size.depth / 2 + ball.r &&
            pos.z >= p[1].pos.z - p[1].size.depth / 2 - ball.r
        ) {
            ball.vec.x = -ball.vec.x;
            emit({ type: "paddle-collision" });
        }
        return ok();
    };

    const detectOutOfBounds = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const { pos } = ball;
        const { board } = config;
        if (pos.x < -board.size.width / 2) {
            scores[1]++;
            resetBall();
        } else if (pos.x > board.size.width / 2) {
            scores[0]++;
            resetBall();
        }
        return ok();
    };

    const resetBall = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        ball.pos = { x: 0, y: 0, z: 0 };
        ball.vec = { x: 0, y: 0, z: 0 }; // Stop the ball temporarily

        // Probably should be handled by a config var
        setTimeout(() => {
            // Randomize ball direction
            const randomAngle = Math.random() * Math.PI * 2;
            ball.vec.x = ball.speed * Math.cos(randomAngle);
            ball.vec.z = ball.speed * Math.sin(randomAngle);

            // Check out why this adjument is needed
            if (Math.abs(ball.vec.x) < 0.3 * ball.speed) {
                ball.vec.x = ball.vec.x > 0 ? 0.3 * ball.speed : -0.3 * ball.speed;
            }
        }, config.resetDelay);
        return ok();
    };

    const checkWins = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        if (scores.some((n) => n >= config.playTo)) {
            status = "ended";
            emit({ type: "game-end", winner: scores[0] >= config.playTo ? 0 : 1 });
        }

        return ok();
    };

    const getState = (): Result<PongState, Error> => {
        return ok({
            status,
            scores,
            ball,
            paddles,
        });
    };

    const tick = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        moveBall();
        userInputs.forEach((input, i) => movePaddle(i, input));
        detectCollisions();
        detectOutOfBounds();
        checkWins();

        const state = getState();
        if (state.isOk()) {
            emit({ type: "state-update", state: state.value });
        }

        return ok();
    };

    const start = (): Result<void, Error> => {
        if (status === "ongoing") {
            return err(new Error("Game has already started"));
        }

        status = "ongoing";
        interval = setInterval(tick, tickRate);
        emit({ type: "game-start" });
        return ok();
    };

    const stop = () => {
        status = "ended";
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        // Emit game end, depends on how this should be used
    };

    const setInput = (i: number, key: UserInput): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        userInputs[i] = key;
        return ok();
    };

    return { start, stop, onEvent, setInput, getState };
};
