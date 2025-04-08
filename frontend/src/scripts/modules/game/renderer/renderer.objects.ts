import { Engine, Scene, Vector3 } from "@babylonjs/core";
import { defaultGameConfig } from "@darrenkuro/pong-core";
import { createBall } from "../objects/objects.ball";
import { createPaddle } from "../objects/objects.paddle";
import { createScore } from "../objects/objects.score";

export const createObjects = (engine: Engine, scene: Scene) => {
    //createBoard(scene, new Vector3(0, -0.5, 0), defaultGameConfig.board.size);

    // Create ball
    const ballPos = new Vector3(0, 0, 0);
    const ballRadius = defaultGameConfig.ball.r;
    engine.objs.ball = createBall(scene, ballPos, ballRadius);

    // Create paddles
    const leftPaddlePos = new Vector3(-defaultGameConfig.paddles[0].pos.x / 2 + 0.5, 0.5, 0); // TODO: Check correct value
    const leftPaddleSize = defaultGameConfig.paddles[0].size;
    const rightPaddlePos = new Vector3(defaultGameConfig.paddles[1].pos.x / 2 - 0.5, 0.5, 0); // TODO: Check correct value
    const rightPaddleSize = defaultGameConfig.paddles[1].size;
    engine.objs.leftPaddle = createPaddle("leftPaddle", scene, leftPaddlePos, leftPaddleSize);
    engine.objs.rightPaddle = createPaddle("rightPaddle", scene, rightPaddlePos, rightPaddleSize);

    // Create score
    const scorePos = new Vector3(0, 1, defaultGameConfig.board.size.depth / 2 + 0.5);
    createScore(engine, scene, [0, 0], scorePos);
};
