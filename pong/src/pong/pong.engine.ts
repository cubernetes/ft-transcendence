import { Result, err, ok } from "neverthrow";
import { defaultGameConfig } from "./pong.config";
import {
    Ball,
    EventCallback,
    Paddle,
    PongConfig,
    PongEngineEventMap,
    PongState,
    PongStatus,
    UserInput,
} from "./pong.types";

// Enforce 2 players for now
export const createPongEngine = (config: PongConfig = defaultGameConfig) => {
    const listeners: { [K in keyof PongEngineEventMap]?: EventCallback<K>[] } = {};
    const userInputs: [UserInput, UserInput] = ["stop", "stop"];
    const scores: [number, number] = [0, 0];
    const paddles: [Paddle, Paddle] = config.paddles;
    const ball: Ball = config.ball;
    const tickRate = 1000 / config.fps;
    let interval: ReturnType<typeof setInterval> | null = null;
    let status: PongStatus = "waiting";

    const emit = <K extends keyof PongEngineEventMap>(
        eventType: K,
        payload: PongEngineEventMap[K]
    ): void => {
        listeners[eventType]?.forEach((cb) => cb(payload));
    };

    const onEvent = <K extends keyof PongEngineEventMap>(
        eventType: K,
        cb: EventCallback<K>
    ): void => {
        listeners[eventType] ??= [];
        if (!listeners[eventType].includes(cb)) {
            listeners[eventType].push(cb);
        }
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
        const bottomLimit = -board.size.depth / 2 + paddle.size.depth / 2;
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
            emit("wall-collision", null);
        }
        return ok();
    };

    const detectCollisions = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        const { pos } = ball;
        const p = paddles;

        // TODO: after paddle collsion, the ball should probably be pushed out a little
        //       so that it wouldn't get caught in the paddle, known error, fix later
        // TODO: Check and clean up this logic
        if (
            pos.x <= p[0].pos.x + p[0].size.width / 2 + ball.r &&
            pos.x >= p[0].pos.x - p[0].size.width / 2 - ball.r &&
            pos.z <= p[0].pos.z + p[0].size.depth / 2 + ball.r &&
            pos.z >= p[0].pos.z - p[0].size.depth / 2 - ball.r
        ) {
            ball.vec.x = -ball.vec.x;
            emit("paddle-collision", null);
        }

        if (
            pos.x >= p[1].pos.x - p[1].size.width / 2 - ball.r &&
            pos.x <= p[1].pos.x + p[1].size.width / 2 + ball.r &&
            pos.z <= p[1].pos.z + p[1].size.depth / 2 + ball.r &&
            pos.z >= p[1].pos.z - p[1].size.depth / 2 - ball.r
        ) {
            ball.vec.x = -ball.vec.x;
            emit("paddle-collision", null);
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
            emit("score-update", { scores });
            resetBall();
        } else if (pos.x > board.size.width / 2) {
            scores[0]++;
            emit("score-update", { scores });
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
            // TODO: This direction shouldn't be too vertical
            // Also, when the angle become generally too vertical, maybe turn back so it doesn't get stuck for too long?
            const randomAngle = Math.random() * Math.PI * 2;
            ball.vec.x = ball.speed * Math.cos(randomAngle);
            ball.vec.z = ball.speed * Math.sin(randomAngle);

            // Ensures the ball to move at intended speed
            const speedFactor = ball.speed / Math.sqrt(ball.vec.x ** 2 + ball.vec.z ** 2);
            ball.vec.x *= speedFactor;
            ball.vec.z *= speedFactor;
        }, config.resetDelay);
        return ok();
    };

    const checkWins = (): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        if (scores.some((n) => n >= config.playTo)) {
            status = "ended";
            emit("game-end", { winner: scores[0] >= config.playTo ? 0 : 1 });
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

        userInputs.forEach((input, i) => movePaddle(i, input));
        moveBall();
        detectCollisions();
        detectOutOfBounds();
        checkWins();

        const state = getState();
        if (state.isOk()) {
            emit("state-update", { state: state.value });
        }

        return ok();
    };

    const start = (): Result<void, Error> => {
        if (status === "ongoing") {
            return err(new Error("Game has already started"));
        }

        status = "ongoing";
        interval = setInterval(tick, tickRate);
        emit("game-start", null);
        return ok();
    };

    const stop = () => {
        if (status !== "ended") {
            status = "ended";
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            emit("game-end", { winner: scores[0] > scores[1] ? 0 : 1 });
        }
    };

    const setInput = (i: number, key: UserInput): Result<void, Error> => {
        if (status !== "ongoing") {
            return err(new Error("Game is not ongoing"));
        }

        userInputs[i] = key;
        return ok();
    };

    /** Reset all game states */
    // TODO: more through check about how to properly reset all states cleanly
    const reset = () => {
        (Object.keys(listeners) as Array<keyof PongEngineEventMap>).forEach((key) => {
            listeners[key] = [];
        });
        userInputs[0] = "stop";
        userInputs[1] = "stop";
        scores[0] = 0;
        scores[1] = 1;
        paddles[0] = { ...config.paddles[0] };
        paddles[1] = { ...config.paddles[1] };
        ball.pos = config.ball.pos;
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        status = "waiting";
    };

    /** For debug, delete later */
    const getInternalState = () => {
        return { listeners, userInputs, scores, paddles, ball, tickRate, interval, status };
    };

    return { start, stop, onEvent, setInput, reset, getInternalState };
};
