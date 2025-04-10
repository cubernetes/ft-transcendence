import { Engine, Scene, Vector3 } from "@babylonjs/core";
import { Size3D, defaultGameConfig } from "@darrenkuro/pong-core";
import { createBall } from "../objects/objects.ball";
import { createBoard } from "../objects/objects.board";
import { createPaddle } from "../objects/objects.paddle";
import { createScore } from "../objects/objects.score";
import { createWalls } from "../objects/objects.wall";

export const createObjects = (engine: Engine) => {
    const { scene } = engine;
    // Create board
    createBoard(scene, new Vector3(0, -0.5, 0), defaultGameConfig.board.size);
    createWalls(scene, defaultGameConfig.board.size);

    // Create ball
    const ballPos = new Vector3(0, 0, 0);
    const ballRadius = defaultGameConfig.ball.r;
    engine.ball = createBall(engine, scene, ballPos, ballRadius);

    // Create paddles
    const leftPaddlePos = new Vector3(-defaultGameConfig.paddles[0].pos.x / 2 + 0.5, 0.5, 0); // TODO: Check correct value
    const leftPaddleSize = defaultGameConfig.paddles[0].size;
    const rightPaddlePos = new Vector3(defaultGameConfig.paddles[1].pos.x / 2 - 0.5, 0.5, 0); // TODO: Check correct value
    const rightPaddleSize = defaultGameConfig.paddles[1].size;
    engine.leftPaddle = createPaddle("leftPaddle", scene, leftPaddlePos, leftPaddleSize);
    engine.rightPaddle = createPaddle("rightPaddle", scene, rightPaddlePos, rightPaddleSize);

    // Create score
    const scorePos = new Vector3(0, 1, defaultGameConfig.board.size.depth / 2 + 0.5);
    createScore(engine, [0, 0], scorePos);
};
