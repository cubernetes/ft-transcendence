import { PongConfig } from "./pong.types.ts";

export const defaultGameConfig: PongConfig = {
    boardWidth: 20,
    boardHeight: 0.1,
    boardDepth: 15,
    paddleWidth: 0.2,
    paddleHeight: 0.3,
    paddleDepth: 5,
    ballRadius: 0.3,
    paddleSpeed: 0.3,
    ballSpeed: 0.2,
    playTo: 11,
};
