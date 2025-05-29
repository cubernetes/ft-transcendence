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

/** Angle threshold in radians – avoid trajectories that are too steep */
const MIN_X_ANGLE = Math.PI / 6; // ±30° from the horizontal

/** Minimal acos – avoid trajectories that are too vertical */
const MIN_X_RATIO = 0.25; // ~ 75°

/** Max acos – avoid trajectories that are too flat */
const MAX_X_RATIO = 0.9; // ~ 25°

const RESET_DELAY = 1500;
const FPS = 60;

export const createPongEngine = (cfg: Partial<PongConfig> = {}) => {
    // Deep clone default then merge overrides
    const config: PongConfig = deepAssign<PongConfig>(
        structuredClone(defaultGameConfig),
        cfg,
        true
    );

    // Fully own internal states
    const scores: [number, number] = [0, 0];
    const hits: [number, number] = [0, 0];
    const userInputs: [UserInput, UserInput] = ["stop", "stop"];

    const paddles = [...config.paddles].map((p) => deepAssign({}, p, true)) as [Paddle, Paddle];
    const ball = deepAssign({}, config.ball, true) as Ball;

    let tickRate = 1000 / FPS;
    let interval: ReturnType<typeof setInterval> | null = null;
    let status: Status = "waiting";

    // #region >>>> Event system -------------------------------------------------------------
    const listeners: { [K in keyof EventMap]: Set<EventCb<K>> } = {
        "wall-collision": new Set(),
        "paddle-collision": new Set(),
        "score-update": new Set(),
        "state-update": new Set(),
        "game-end": new Set(),
    };

    const emit = <K extends keyof EventMap>(type: K, payload: EventMap[K]) => {
        listeners[type].forEach((cb) => cb(payload));
    };

    const onEvent = <K extends keyof EventMap>(type: K, cb: EventCb<K>) => {
        listeners[type].add(cb);
    };
    // #endregion

    // #region >>>> Movement helpers ---------------------------------------------------------
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    const movePaddle = (i: 0 | 1, input: UserInput) => {
        const paddle = paddles[i];
        const lim = config.board.size.depth / 2 - paddle.size.depth / 2;

        if (input === "up") paddle.pos.z = clamp(paddle.pos.z + paddle.speed, -lim, lim);
        if (input === "down") paddle.pos.z = clamp(paddle.pos.z - paddle.speed, -lim, lim);
    };

    const moveBall = () => {
        ball.pos.x += ball.vec.x;
        ball.pos.z += ball.vec.z;

        const lim = config.board.size.depth / 2 - ball.r;
        if (Math.abs(ball.pos.z) > lim) {
            ball.vec.z *= -1;
            clampAngleRatio();
            // Snap inside bounds so it won't get stuck
            ball.pos.z = clamp(ball.pos.z, -lim, lim);
            emit("wall-collision", null);
        }
    };
    // #endregion

    // #region >>>> Collision detection helpers ----------------------------------------------
    const collidesCircleRect = (ball: Ball, p: Paddle): boolean => {
        const hx = p.size.width / 2;
        const hz = p.size.depth / 2;
        const dx = Math.abs(ball.pos.x - p.pos.x) - hx;
        const dz = Math.abs(ball.pos.z - p.pos.z) - hz;

        // Clamp to zero => distance from rect surface
        const closestX = Math.max(dx, 0);
        const closestZ = Math.max(dz, 0);

        // If the squared distance from the circle center to the rect ≤ r², they overlap
        return closestX * closestX + closestZ * closestZ <= ball.r * ball.r;
    };

    const checkPaddleCollision = (idx: 0 | 1): boolean => {
        const p = paddles[idx];

        if (!collidesCircleRect(ball, p)) return false;

        // Collision confirmed – reflect and nudge the ball out so it can't stick
        ball.vec.x *= -1;
        clampAngleRatio();

        ball.pos.x =
            idx === 0
                ? p.pos.x + p.size.width / 2 + ball.r + 0.1
                : p.pos.x - p.size.width / 2 - ball.r - 0.1;
        hits[idx]++;
        emit("paddle-collision", null);
        return true;
    };

    // #endregion

    // #region
    const detectScore = () => {
        const half = config.board.size.width / 2;
        if (ball.pos.x < -half) {
            scores[1]++;
            resetBall();
            emit("score-update", { scores: [...scores] });
        }
        if (ball.pos.x > half) {
            scores[0]++;
            resetBall();
            emit("score-update", { scores: [...scores] });
        }
    };

    // #endregion

    const clampAngleRatio = () => {
        const speed = ball.speed;
        const absVx = Math.abs(ball.vec.x);
        if (!speed) return;

        let ratio = absVx / speed;
        if (ratio < MIN_X_RATIO || ratio > MAX_X_RATIO) {
            ratio = clamp(ratio, MIN_X_RATIO, MAX_X_RATIO);
            const newVx = speed * ratio;
            const newVz = Math.sqrt(speed * speed - newVx * newVx);
            ball.vec.x = Math.sign(ball.vec.x) * newVx;
            ball.vec.z = Math.sign(ball.vec.z) * newVz;
        }
    };

    const randomizeDirection = () => {
        let angle: number;
        do {
            angle = Math.random() * 2 * Math.PI;
        } while (Math.abs(Math.cos(angle)) < Math.cos(MIN_X_ANGLE));

        ball.vec.x = ball.speed * Math.cos(angle);
        ball.vec.z = ball.speed * Math.sin(angle);
    };

    const resetBall = () => {
        ball.pos = { x: 0, y: 0.5, z: 0 };
        ball.vec = { x: 0, y: 0, z: 0 };
        setTimeout(randomizeDirection, RESET_DELAY);
    };

    // -----------------------

    const getState = (): State => structuredClone({ status, scores, ball, paddles });
    const getHits = () => structuredClone(hits);
    const getConfig = (): PongConfig => structuredClone(config);
    const setStatus = (input: Status) => (status = input);

    const tick = (): Result<void, ErrorCode> => {
        if (status !== "ongoing") return err("GAME_STATUS_ERROR");

        userInputs.forEach((input, i) => movePaddle(i as 0 | 1, input));
        moveBall();
        checkPaddleCollision(0);
        checkPaddleCollision(1);
        detectScore();

        // Check if a player has won
        if (scores.some((n) => n >= config.playTo)) {
            emit("game-end", {
                winner: scores[0] > scores[1] ? 0 : 1,
                hits: [...hits],
                state: getState(),
            });
            stop();
            return ok();
        }

        emit("state-update", { state: getState() });

        return ok();
    };

    const start = (): Result<void, ErrorCode> => {
        if (status === "ongoing" || status === "ended") return err("GAME_STATUS_ERROR");

        status = "ongoing";
        if (config.aiMode && config.aiDifficulty) {
            const aiEngine = { onEvent, setInput, getConfig };
            createAIPlayer(aiEngine, config.aiDifficulty, 1);
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
        status = "ended";

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

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

        // Hard reset on ball and paddle position
        ball.pos = { x: 0, y: 0.5, z: 0 };
        paddles[0].pos = { x: -config.board.size.width / 2 + 0.5, y: 0.5, z: 0 };
        paddles[1].pos = { x: config.board.size.width / 2 - 0.5, y: 0.5, z: 0 };

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

        return ok();
    };

    return {
        start,
        pause,
        stop,
        onEvent,
        setInput,
        reset,
        getConfig,
        getState,
        getHits,
        setStatus,
    };
};
