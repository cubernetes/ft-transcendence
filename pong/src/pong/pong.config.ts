import { PongConfig } from "./pong.types";

const defaultBoard = {
    size: { width: 20, height: 0.1, depth: 15 },
};

const defaultBall = {
    pos: { x: 0, y: 0, z: 0 },
    vec: { x: 0.2, y: 0, z: 0.2 },
    r: 0.3,
    speed: 0.2,
};

const defaultPaddleLeft = {
    pos: { x: -defaultBoard.size.width / 2 + 0.5, y: 0.5, z: 0 },
    size: { width: 0.2, height: 0.3, depth: 5 },
    speed: 0.3,
};

const defaultPaddleRight = {
    pos: { x: defaultBoard.size.width / 2 - 0.5, y: 0.5, z: 0 },
    size: { width: 0.2, height: 0.3, depth: 5 },
    speed: 0.3,
};

export const defaultGameConfig: PongConfig = {
    board: defaultBoard,
    paddles: [defaultPaddleLeft, defaultPaddleRight],
    ball: defaultBall,
    playTo: 11,
    fps: 60,
    resetDelay: 1500,
    aiMode: false,
};
