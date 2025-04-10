import { Engine, Quaternion, Vector3 } from "@babylonjs/core";
import {
    Ball,
    GameMode,
    PongEngine,
    PongState,
    Position3D,
    defaultGameConfig,
    registerOutgoingMessageHandler as registerHandler,
} from "@darrenkuro/pong-core";
import { hideCanvas, hidePageElements, hideRouter, showCanvas } from "../layout/layout.service";
import { sendGameAction } from "../ws/ws.service";
import { wsStore } from "../ws/ws.store";
import { disposeScene } from "./game.renderer";
import { createScore } from "./objects/objects.score";
import { pulseBall, pulseLight } from "./renderer/renderer.animations";
import { showGameOver } from "./renderer/renderer.event";
import { createScene } from "./renderer/renderer.scene";

/** Renderer will be hidden behind controller and controller is the user interface */
export const createGameController = (renderer: Engine, engine: PongEngine) => {
    const handleKeydownLocal = (evt: KeyboardEvent) => {
        if (window.cfg.key.lup.includes(evt.key)) {
            engine.setInput(0, "up");
        } else if (window.cfg.key.ldown.includes(evt.key)) {
            engine.setInput(0, "down");
        } else if (window.cfg.key.rup.includes(evt.key)) {
            engine.setInput(1, "up");
        } else if (window.cfg.key.rdown.includes(evt.key)) {
            engine.setInput(1, "down");
        }
    };

    const handleKeyupLocal = (evt: KeyboardEvent) => {
        if (window.cfg.key.left.includes(evt.key)) {
            engine.setInput(0, "stop");
        }
        if (window.cfg.key.right.includes(evt.key)) {
            engine.setInput(1, "stop");
        }
    };

    const handleKeydownAi = (evt: KeyboardEvent) => {
        if (window.cfg.key.up.includes(evt.key)) {
            engine.setInput(0, "up");
        }
        if (window.cfg.key.down.includes(evt.key)) {
            engine.setInput(0, "down");
        }
    };

    const handleKeyupAi = (evt: KeyboardEvent) => {
        if (window.cfg.key.paddle.includes(evt.key)) {
            engine.setInput(0, "stop");
        }
    };

    const handleKeydownOnline = (evt: KeyboardEvent) => {
        if (window.cfg.key.up.includes(evt.key)) {
            sendGameAction("up");
        }
        if (window.cfg.key.down.includes(evt.key)) {
            sendGameAction("down");
        }
    };

    const handleKeyupOnline = (evt: KeyboardEvent) => {
        if (window.cfg.key.paddle.includes(evt.key)) {
            sendGameAction("stop");
        }
    };

    const attachLocalControl = () => {
        document.addEventListener("keydown", handleKeydownLocal);
        document.addEventListener("keyup", handleKeyupLocal);
    };

    const detachLocalControl = () => {
        document.removeEventListener("keydown", handleKeydownLocal);
        document.removeEventListener("keyup", handleKeyupLocal);
    };

    const attachOnlineControl = () => {
        document.addEventListener("keydown", handleKeydownOnline);
        document.addEventListener("keyup", handleKeyupOnline);
    };

    const detachOnlineControl = () => {
        document.removeEventListener("keydown", handleKeydownOnline);
        document.removeEventListener("keyup", handleKeyupOnline);
    };

    const attachAiControl = () => {
        document.addEventListener("keydown", handleKeydownAi);
        document.addEventListener("keyup", handleKeyupAi);
    };

    const detachAiControl = () => {
        document.removeEventListener("keydown", handleKeydownAi);
        document.removeEventListener("keyup", handleKeyupAi);
    };

    /** Detach all event controllers because it is safe to remove ones that don't exist */
    const detachAllControls = () => {
        detachLocalControl();
        detachOnlineControl();
        detachAiControl();
    };

    const attachLocalEngineEvents = () => {
        engine.onEvent("wall-collision", handleWallCollision);
        engine.onEvent("paddle-collision", handlePaddleCollision);
        engine.onEvent("score-update", (evt) => updateScores(evt.scores));
        engine.onEvent("state-update", (evt) => updateState(evt.state));
        engine.onEvent("ball-reset", handleBallReset);
        // TODO: GET NAME
        engine.onEvent("game-end", (_) => handleEndGame("winnerName"));
    };

    const attachOnlineSocketEvents = () => {
        const { isConnected, handlers } = wsStore.get();
        if (!isConnected) {
            window.log.error("Online game ongoing but socket is not connected");
            return;
        }

        registerHandler("wall-collision", handleWallCollision, handlers);
        registerHandler("paddle-collision", handlePaddleCollision, handlers);
        registerHandler("state-update", ({ state }) => updateState(state), handlers);
        registerHandler("score-update", ({ scores }) => updateScores(scores), handlers);
        registerHandler("ball-reset", handleBallReset, handlers);
        // TODO: Get name
        registerHandler("game-end", ({ winner }) => handleEndGame("winnerName"), handlers);
    };

    const updateBall = (newBall: Ball) => {
        const oldBallPos = renderer.ball.position;
        // Set new position
        renderer.ball.position.set(newBall.pos.x, newBall.pos.y, newBall.pos.z);

        // Rotation: movement in XZ-plane
        const dx = newBall.pos.x - oldBallPos.x;
        const dz = newBall.pos.z - oldBallPos.z;
        const distance = Math.hypot(dx, dz);
        const angle = distance / newBall.r;
        const axis = new Vector3(-dz, 0.5, dx).normalize();

        // Convert angle and axis to quaternion
        const q = Quaternion.RotationAxis(axis, angle);
        renderer.ball.rotationQuaternion = q.multiply(renderer.ball.rotationQuaternion!);
    };

    const updateLeftPaddle = (pos: Position3D) => {
        renderer.leftPaddle.position.set(pos.x, pos.y, pos.z);
    };

    const updateRightPaddle = (pos: Position3D) => {
        renderer.rightPaddle.position.set(pos.x, pos.y, pos.z);
    };

    const updateScores = (scores: [number, number]) => {
        // TODO: duplicate code
        const scorePos = new Vector3(0, 1, defaultGameConfig.board.size.depth / 2 + 0.5);
        createScore(renderer, scores, scorePos);
        if (renderer.soundsEnabled) {
            renderer.audio.ballSound.play();
        }
        pulseLight(renderer.directionalLight, renderer.scene);
    };

    const handleWallCollision = () => {
        if (renderer.soundsEnabled) {
            renderer.audio.ballSound.play();
        }
        pulseBall(renderer.ballMat, renderer.scene);
    };

    const handlePaddleCollision = () => {
        if (renderer.soundsEnabled) {
            renderer.audio.hitSound.play();
        }
    };

    const handleBallReset = () => {
        if (renderer.soundsEnabled) {
            renderer.audio.ballSound.play();
        }
    };

    const handleEndGame = (winner: string) => {
        // Attach that in payload later
        showGameOver(renderer.scene, renderer.camera, winner);

        // Dispose stuff right away? Probably not..
    };

    const updateState = (state: PongState) => {
        updateBall(state.ball);
        updateLeftPaddle(state.paddles[0].pos);
        updateRightPaddle(state.paddles[1].pos);
    };

    const resizeListener = () => renderer.resize();

    /** Destroy the current game session */
    const destory = () => {
        // Destory renderer related stuff
        disposeScene(renderer);
        renderer.stopRenderLoop();

        // Reset engine
        engine.stop();
        engine.reset();

        // Remove event listeners
        window.removeEventListener("resize", resizeListener);
        detachAllControls();

        hideCanvas();
    };

    const startRenderer = () => {
        renderer.scene = createScene(renderer);

        renderer.runRenderLoop(() => {
            renderer.scene.render();
        });

        window.addEventListener("resize", resizeListener);

        // Initial scale
        requestAnimationFrame(() => renderer.resize());
    };

    const startLocalGame = () => {
        attachLocalControl();
        attachLocalEngineEvents();
        engine.start();
        startRenderer();
    };

    const startOnlineGame = () => {
        attachOnlineControl();
        attachOnlineSocketEvents();
        startRenderer();
    };

    const startAiGame = () => {
        attachAiControl();
        attachLocalEngineEvents();
        // TODO: config AI to pongEngine here
        engine.start();
        startRenderer();
    };

    const startGame = (mode: GameMode) => {
        hidePageElements();
        hideRouter();
        showCanvas();

        switch (mode) {
            case "local":
                startLocalGame();
                break;
            case "online":
                startOnlineGame();
                break;
            case "ai":
                startAiGame();
                break;
            default:
        }
    };
    return {
        destory,
        startGame,
    };
};
