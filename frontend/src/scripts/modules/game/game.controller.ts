import { Engine, Quaternion, Vector3 } from "@babylonjs/core";
import { Ball, PongState, Position3D, defaultGameConfig } from "@darrenkuro/pong-core";
import { createScore } from "./objects/objects.score";
import { pulseBall, pulseLight } from "./renderer/renderer.animations";
import { showGameOver } from "./renderer/renderer.event";

/** Renderer will be hidden behind controller and controller is the user interface */
export const createGameController = (engine: Engine) => {
    const updateBall = (newBall: Ball) => {
        const oldBallPos = engine.ball.position;
        // Set new position
        engine.ball.position.set(newBall.pos.x, newBall.pos.y, newBall.pos.z);

        // Rotation: movement in XZ-plane
        const dx = newBall.pos.x - oldBallPos.x;
        const dz = newBall.pos.z - oldBallPos.z;
        const distance = Math.hypot(dx, dz);
        const angle = distance / newBall.r;
        const axis = new Vector3(-dz, 0.5, dx).normalize();

        // Convert angle and axis to quaternion
        const q = Quaternion.RotationAxis(axis, angle);
        engine.ball.rotationQuaternion = q.multiply(engine.ball.rotationQuaternion!);
    };

    const updateLeftPaddle = (pos: Position3D) => {
        engine.leftPaddle.position.set(pos.x, pos.y, pos.z);
    };

    const updateRightPaddle = (pos: Position3D) => {
        engine.rightPaddle.position.set(pos.x, pos.y, pos.z);
    };

    const updateScores = (scores: [number, number]) => {
        // TODO: duplicate code
        const scorePos = new Vector3(0, 1, defaultGameConfig.board.size.depth / 2 + 0.5);
        createScore(engine, scores, scorePos);
        if (engine.soundsEnabled) {
            engine.audio.ballSound.play();
        }
        pulseLight(engine.directionalLight, engine.scene);
    };

    const handleWallCollision = () => {
        if (engine.soundsEnabled) {
            engine.audio.ballSound.play();
        }
        pulseBall(engine.ballMat, engine.scene);
    };

    const handlePaddleCollision = () => {
        if (engine.soundsEnabled) {
            engine.audio.hitSound.play();
        }
    };

    const handleBallReset = () => {
        if (engine.soundsEnabled) {
            engine.audio.ballSound.play();
        }
    };

    const handleEndGame = (winner: string) => {
        // Attach that in payload later
        showGameOver(engine.scene, engine.camera, winner);

        // Dispose stuff right away? Probably not..
    };

    const updateState = (state: PongState) => {
        updateBall(state.ball);
        updateLeftPaddle(state.paddles[0].pos);
        updateRightPaddle(state.paddles[1].pos);
    };

    return {
        updateState,
        updateScores,
        handleWallCollision,
        handlePaddleCollision,
        handleBallReset,
        handleEndGame,
    };
};
