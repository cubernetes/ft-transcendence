import { Engine, Vector3 } from "@babylonjs/core";
import { PongConfig } from "@darrenkuro/pong-core";
import { createBall } from "../objects/objects.ball";
import { createBoard } from "../objects/objects.board";
import { createPaddle } from "../objects/objects.paddle";
import { createScore } from "../objects/objects.score";
import { createWalls } from "../objects/objects.wall";

export const createObjects = (engine: Engine, config: PongConfig) => {
    const { scene } = engine;
    if (!scene) {
        return window.log.error("Fail to create objects, can't find scene");
    }

    // Create board
    createBoard(scene, new Vector3(0, -0.5, 0), config.board.size);
    createWalls(scene, config.board.size);

    // Create ball
    const ballPos = new Vector3(0, 0, 0);
    const ballRadius = config.ball.r;
    engine.ball = createBall(engine, scene, ballPos, ballRadius);

    // Create paddles
    const leftPaddlePos = new Vector3(-config.paddles[0].pos.x / 2 + 0.5, 0.5, 0); // TODO: Check correct value
    const leftPaddleSize = config.paddles[0].size;
    const rightPaddlePos = new Vector3(config.paddles[1].pos.x / 2 - 0.5, 0.5, 0); // TODO: Check correct value
    const rightPaddleSize = config.paddles[1].size;
    engine.leftPaddle = createPaddle("leftPaddle", scene, leftPaddlePos, leftPaddleSize);
    engine.rightPaddle = createPaddle("rightPaddle", scene, rightPaddlePos, rightPaddleSize);

    // Create score
    const scorePos = new Vector3(0, 1, config.board.size.depth / 2 + 0.5);
    createScore(engine, [0, 0], scorePos);
};
