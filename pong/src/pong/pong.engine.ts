import { Result, err, ok } from "neverthrow";
import { createAIPlayer } from "../ai";
import { ErrorCode } from "../schemas/schemas.api";
import { deepAssign } from "../utils";
import { defaultGameConfig } from "./pong.config";
import {
    Ball,
    EventCb,
    EventMap,
    Paddle,
    PongConfig,
    State,
    Status,
    UserInput,
} from "./pong.types";

export const createPongEngine = (cfg: PongConfig = defaultGameConfig) => {
    const config: PongConfig = cfg;
    const listeners: { [K in keyof EventMap]: Set<EventCb<K>> } = {
        "wall-collision": new Set(),
        "paddle-collision": new Set(),
        "score-update": new Set(),
        "state-update": new Set(),
        "ball-reset": new Set(),
        "game-end": new Set(),
    };
    const scores: [number, number] = [0, 0];
    const hits: [number, number] = [0, 0];
    const userInputs: [UserInput, UserInput] = ["stop", "stop"];
    const paddles: [Paddle, Paddle] = [...config.paddles]; // Use value instead of ref
    const ball: Ball = { ...config.ball }; // Use value instead of ref
    let tickRate = 1000 / config.fps;
    let interval: ReturnType<typeof setInterval> | null = null;
    let status: Status = "waiting";

    const emit = <K extends keyof EventMap>(type: K, payload: EventMap[K]) => {
        listeners[type]?.forEach((cb) => cb(payload));
    };

    const onEvent = <K extends keyof EventMap>(type: K, cb: EventCb<K>) => {
        listeners[type].add(cb);
    };

    const movePaddle = (i: 0 | 1, direction: UserInput): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

        const paddle = paddles[i];

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

    const moveBall = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

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

    const detectCollisions = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

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
            hits[0]++;
            emit("paddle-collision", null);
        }

        if (
            pos.x >= p[1].pos.x - p[1].size.width / 2 - ball.r &&
            pos.x <= p[1].pos.x + p[1].size.width / 2 + ball.r &&
            pos.z <= p[1].pos.z + p[1].size.depth / 2 + ball.r &&
            pos.z >= p[1].pos.z - p[1].size.depth / 2 - ball.r
        ) {
            ball.vec.x = -ball.vec.x;
            hits[1]++;
            emit("paddle-collision", null);
        }
        return ok();
    };

    const detectOutOfBounds = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

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

    const resetBall = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

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

    const checkWins = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

        const state = getState();

        if (scores.some((n) => n >= config.playTo)) {
            stop();
            status = "ended";
            emit("game-end", { winner: scores[0] > scores[1] ? 0 : 1, hits, state });
        }

        return ok();
    };

    const getState = (): State => ({ status, scores, ball, paddles });

    const getConfig = (): PongConfig => config;

    const tick = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

        userInputs.forEach((input, i) => movePaddle(i as 0 | 1, input));
        moveBall();
        detectCollisions();
        detectOutOfBounds();
        checkWins();

        const state = getState();
        emit("state-update", { state });

        return ok();
    };

    const start = (): Result<void, ErrorCode> => {
        if (status === "ongoing" || status === "ended") return err("GAME_STATUS_ERROR");

        status = "ongoing";
        if (config.aiMode && config.aiDifficulty) {
            createAIPlayer({ onEvent, setInput }, config.aiDifficulty, 1);
        }

        interval = setInterval(tick, tickRate);
        return ok();
    };

    const pause = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");
        if (!interval) return err("CORRUPTED_DATA");

        status = "paused";
        clearInterval(interval);
        interval = null;
        return ok();
    };

    const stop = (): Result<void, ErrorCode> => {
        if (status === "ended") return err("GAME_STATUS_ERROR");
        if (!interval) return err("CORRUPTED_DATA");

        status = "ended";
        clearInterval(interval);
        interval = null;

        const state = getState();
        emit("game-end", { winner: scores[0] > scores[1] ? 0 : 1, hits, state });
        return ok();
    };

    const setInput = (i: 0 | 1, key: UserInput): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

        userInputs[i] = key;
        return ok();
    };

    /** Reset all game states, will skip undefined */
    const reset = (cfg: Partial<PongConfig>): Result<void, ErrorCode> => {
        if (status === "ongoing" || status === "paused") return err("GAME_STATUS_ERROR");

        // Update config
        deepAssign(config, cfg, true);

        // Clear listeners
        Object.values(listeners).forEach((set) => set.clear());

        // Complete reset
        userInputs.fill("stop");
        scores.fill(0);
        hits.fill(0);
        paddles.forEach((p, i) => deepAssign(p, config.paddles[i]));
        deepAssign(ball, config.ball);
        status = "waiting";

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

        return ok();
    };

    return { start, pause, stop, onEvent, setInput, reset, getConfig };
};
