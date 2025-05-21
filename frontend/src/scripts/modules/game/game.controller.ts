import { Engine, Quaternion, Vector3 } from "@babylonjs/core";
import {
    Ball,
    GameMode,
    Paddle,
    PongConfig,
    PongEngine,
    PongState,
    Position3D,
    defaultGameConfig,
} from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { hideCanvas, hidePageElements, hideRouter, showCanvas } from "../layout/layout.service";
import { tournamentStore } from "../tournament/tournament.store";
import { registerHandler } from "../ws/ws.controller";
import { sendGameAction, sendGameStart } from "../ws/ws.service";
import { wsStore } from "../ws/ws.store";
import { disposeScene } from "./game.renderer";
import { gameStore } from "./game.store";
import { createScore } from "./objects/objects.score";
import { pulseBall, pulseLight } from "./renderer/renderer.animations";
import { showGameOver } from "./renderer/renderer.event";
import { createScene } from "./renderer/renderer.scene";

/** Renderer will be hidden behind controller and controller is the user interface */
export const createGameController = (renderer: Engine, engine: PongEngine) => {
    const handleKeydownLocal = (evt: KeyboardEvent) => {
        if (CONST.CTRL.L_UP.includes(evt.key)) {
            engine.setInput(0, "up");
        } else if (CONST.CTRL.L_DOWN.includes(evt.key)) {
            engine.setInput(0, "down");
        } else if (CONST.CTRL.R_UP.includes(evt.key)) {
            engine.setInput(1, "up");
        } else if (CONST.CTRL.R_DOWN.includes(evt.key)) {
            engine.setInput(1, "down");
        }
    };

    const handleKeyupLocal = (evt: KeyboardEvent) => {
        if (CONST.CTRL.LEFT.includes(evt.key)) {
            engine.setInput(0, "stop");
        }
        if (CONST.CTRL.RIGHT.includes(evt.key)) {
            engine.setInput(1, "stop");
        }
    };

    const handleKeydownAi = (evt: KeyboardEvent) => {
        if (CONST.CTRL.UP.includes(evt.key)) {
            engine.setInput(0, "up");
        }
        if (CONST.CTRL.DOWN.includes(evt.key)) {
            engine.setInput(0, "down");
        }
    };

    const handleKeyupAi = (evt: KeyboardEvent) => {
        if (CONST.CTRL.ALL.includes(evt.key)) {
            engine.setInput(0, "stop");
        }
    };

    const handleKeydownOnline = (evt: KeyboardEvent) => {
        if (CONST.CTRL.UP.includes(evt.key)) {
            sendGameAction("up");
        }
        if (CONST.CTRL.DOWN.includes(evt.key)) {
            sendGameAction("down");
        }
    };

    const handleKeyupOnline = (evt: KeyboardEvent) => {
        if (CONST.CTRL.ALL.includes(evt.key)) {
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

    const attachLocalEngineEvents = (mode: GameMode) => {
        engine.onEvent("wall-collision", handleWallCollision);
        engine.onEvent("paddle-collision", handlePaddleCollision);
        engine.onEvent("score-update", ({ scores }) => handleScoreUpdate(scores));
        engine.onEvent("state-update", ({ state }) => handleStateUpdate(state));
        engine.onEvent("ball-reset", handleBallReset);
        // TODO: GET NAME
        // Don't hook this for now because game-end event will be called when going away from page
        // And that breaks the page (why navigation wasn't working)
        engine.onEvent("game-end", (evt) => handleEndGame(mode, evt.winner, evt.state));
    };

    const attachOnlineSocketEvents = () => {
        const { isConnected, handlers } = wsStore.get();
        if (!isConnected) return log.error("Socket is not connected when attaching events");

        registerHandler("wall-collision", handleWallCollision, handlers);
        registerHandler("paddle-collision", handlePaddleCollision, handlers);
        registerHandler("state-update", ({ state }) => handleStateUpdate(state), handlers);
        registerHandler("score-update", ({ scores }) => handleScoreUpdate(scores), handlers);
        registerHandler("ball-reset", handleBallReset, handlers);
        // TODO: Get name
        registerHandler(
            "game-end",
            (evt) => handleEndGame("online", evt.winner, evt.state),
            handlers
        );
    };

    const updateBall = (newBall: Ball) => {
        const { x, z } = renderer.ball.position;
        const oldBallPos = { x, z };
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

    const updateLeftPaddle = ({ x, y, z }: Position3D) => renderer.leftPaddle.position.set(x, y, z);

    const updateRightPaddle = ({ x, y, z }: Position3D) =>
        renderer.rightPaddle.position.set(x, y, z);

    const handleScoreUpdate = (scores: [number, number]) => {
        // TODO: duplicate code
        const scorePos = new Vector3(0, 1, defaultGameConfig.board.size.depth / 2 + 0.5);
        createScore(renderer, scores, scorePos);
        if (renderer.sfxEnabled) {
            renderer.audio.ballSound.play();
        }
        pulseLight(renderer.directionalLight, renderer.scene);
    };

    const handleWallCollision = () => {
        if (renderer.sfxEnabled) {
            renderer.audio.ballSound.play();
        }
        pulseBall(renderer.ballMat, renderer.scene);
    };

    const handlePaddleCollision = () => {
        if (renderer.sfxEnabled) {
            renderer.audio.hitSound.play();
        }
    };

    const handleBallReset = () => {
        if (renderer.sfxEnabled) {
            renderer.audio.ballSound.play();
        }
    };

    const handleEndGame = async (mode: GameMode, winner: number, state: PongState) => {
        const { playerNames } = gameStore.get();
        const winnerName = playerNames[winner];
        showGameOver(renderer.scene, renderer.camera, winnerName);
        if (mode === "tournament") {
            const { controller } = tournamentStore.get();
            if (!controller) return log.error("Tournament controller not found");
            await controller.handleEndTournamentMatch(winnerName, state);
            setTimeout(() => {
                navigateTo("tournament", true);
            }, 2000);
        }
        // Dispose stuff right away? Probably not..
    };

    const handleStateUpdate = (state: PongState) => {
        // log.debug(state);
        updateBall(state.ball);
        updateLeftPaddle(state.paddles[0].pos);
        updateRightPaddle(state.paddles[1].pos);
    };

    const resizeListener = () => renderer.resize();

    const startRenderer = (config: PongConfig) => {
        renderer.scene = createScene(renderer, config);
        if (renderer.bgmEnabled) renderer.audio.bgMusic.play();
        if (renderer.shadowsEnabled) renderer.castShadow();

        renderer.runRenderLoop(() => renderer.scene.render());

        window.addEventListener("resize", resizeListener);

        // Initial scale
        requestAnimationFrame(() => renderer.resize());
    };

    /** Destroy the current game session */
    const destroy = () => {
        log.debug("Game controller destroy triggered");
        hideCanvas();

        // Destroy renderer related stuff
        disposeScene(renderer);
        renderer.stopRenderLoop();

        // Reset engine
        // When navigating with back and forward button, engine cannot emit game over
        // need new logic, maybe add "quit" to differentiate
        engine.stop();

        // Remove event listeners
        window.removeEventListener("resize", resizeListener);
        detachAllControls();
    };

    const startLocalGame = (mode: GameMode, config: PongConfig) => {
        engine.reset(config);
        if (mode === "ai") {
            attachAiControl();
        } else {
            attachLocalControl();
        }
        attachLocalEngineEvents(mode);
        engine.start(); // get config
        startRenderer(config); // send config to renderer instead of using default

        gameStore.update({ isPlaying: true });
    };

    const startOnlineGame = (config: PongConfig) => {
        attachOnlineControl();
        attachOnlineSocketEvents();
        startRenderer(config);
    };

    const startGame = (mode: GameMode, config: PongConfig = defaultGameConfig) => {
        hidePageElements();
        hideRouter();
        showCanvas();

        switch (mode) {
            case "local":
            case "tournament":
            case "ai":
                startLocalGame(mode, config);
                break;
            case "online":
                startOnlineGame(config);
                break;
            default:
        }
    };

    return {
        destroy,
        startGame,
    };
};
