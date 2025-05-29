import { ArcRotateCamera, Engine, Quaternion, Vector3 } from "@babylonjs/core";
import {
    Ball,
    GameMode,
    PongConfig,
    PongEngine,
    PongState,
    Position3D,
    defaultGameConfig,
} from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { createButton } from "../../ui/components/Button";
import { createModal } from "../../ui/components/Modal";
import { sendApiRequest } from "../../utils/api";
import { hideCanvas, hidePageElements, hideRouter, showCanvas } from "../layout/layout.service";
import { tournamentStore } from "../tournament/tournament.store";
import { registerHandler } from "../ws/ws.controller";
import { sendGameAction, sendRendererReady } from "../ws/ws.service";
import { wsStore } from "../ws/ws.store";
import { disposeScene } from "./game.renderer";
import { gameStore } from "./game.store";
import { pulseBall } from "./objects/objects.ball";
import { updateScore } from "./objects/objects.score";
import { slideInCamera } from "./renderer/renderer.camera";
import { showCountdown, showGameOver } from "./renderer/renderer.event";
import { handleShadows, pulseLight } from "./renderer/renderer.light";
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
        engine.onEvent("game-end", ({ winner, state }) => handleEndGame(mode, winner, state));
    };

    const attachOnlineSocketEvents = () => {
        const { isConnected, handlers } = wsStore.get();
        if (!isConnected) return log.error("Fail to attach events: no live socket");

        registerHandler("wall-collision", handleWallCollision, handlers);
        registerHandler("paddle-collision", handlePaddleCollision, handlers);
        registerHandler("state-update", ({ state }) => handleStateUpdate(state), handlers);
        registerHandler("score-update", ({ scores }) => handleScoreUpdate(scores), handlers);
        registerHandler(
            "game-end",
            ({ winner, state }) => handleEndGame("online", winner, state),
            handlers
        );
    };

    const updateBall = (newBall: Ball) => {
        const { scene } = renderer;
        if (!scene) return log.warn("Fail to update ball: no active scene");

        const ball = scene.getMeshByName(CONST.NAME.BALL)!;
        const { x, z } = ball.position;
        const oldBallPos = { x, z };
        // Set new position
        ball.position.set(newBall.pos.x, newBall.pos.y, newBall.pos.z);

        // Rotation: movement in XZ-plane
        const dx = newBall.pos.x - oldBallPos.x;
        const dz = newBall.pos.z - oldBallPos.z;
        const distance = Math.hypot(dx, dz);
        const angle = distance / newBall.r;
        const axis = new Vector3(-dz, 0.5, dx).normalize();

        // Convert angle and axis to quaternion
        const q = Quaternion.RotationAxis(axis, angle);
        ball.rotationQuaternion = q.multiply(ball.rotationQuaternion!);
    };

    const updateLeftPaddle = ({ x, y, z }: Position3D) => {
        const { scene } = renderer;
        if (!scene) return log.warn("Fail to update left paddle: no active scene");

        const paddle = scene.getMeshByName(CONST.NAME.LPADDLE)!;
        paddle.position.set(x, y, z);
    };

    const updateRightPaddle = ({ x, y, z }: Position3D) => {
        const { scene } = renderer;
        if (!scene) return log.warn("Fail to update right paddle: no active scene");

        const paddle = scene.getMeshByName(CONST.NAME.RPADDLE)!;
        paddle.position.set(x, y, z);
    };

    const handleScoreUpdate = (scores: [number, number]) => {
        const { scene } = renderer;
        if (!scene) return log.warn("Fail to update score: no active scene");

        updateScore(scene, scores);

        if (renderer.sfxEnabled) {
            renderer.audio.ballSound.play();
        }

        pulseLight(scene);
    };

    const handleWallCollision = () => {
        const { scene } = renderer;
        if (!scene) return log.warn("Fail to handle wall collision: no active scene");

        if (renderer.sfxEnabled) {
            renderer.audio.ballSound.play();
        }

        pulseBall(scene);
    };

    const handlePaddleCollision = () => {
        const { scene } = renderer;
        if (!scene) return;

        if (renderer.sfxEnabled) {
            renderer.audio.hitSound.play();
        }

        const camera = scene.activeCamera as ArcRotateCamera;
    };

    const handleEndGame = async (mode: GameMode, winnerIdx: number, state: PongState) => {
        const { scene } = renderer;
        if (!scene) return log.warn("Fail to handle end game: no active scene");

        scene.stopAnimation(scene.activeCamera);
        countdownController.abort();

        const { playerNames } = gameStore.get();
        const winnerName = playerNames[winnerIdx];
        showGameOver(scene, winnerName);

        if (mode === "tournament") {
            const { controller } = tournamentStore.get();
            if (!controller) return log.error("Tournament controller not found");
            await controller.handleEndTournamentMatch(winnerName, state);
        }

        gameStore.update({ status: "ended" });
        setTimeout(() => {
            const leaveBtn = createButton({
                text: CONST.TEXT.LEAVE,
                tw: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50",
                click: () => {
                    const dest = mode === "tournament" ? CONST.ROUTE.TOURNAMENT : CONST.ROUTE.HOME;
                    endGame();
                    closeModal();
                    navigateTo(dest, true);
                },
            });

            const closeModal = createModal({
                children: [leaveBtn],
                tw: "bg-transparent",
                exitable: false,
            });
        }, 2000);
    };

    const handleStateUpdate = (state: PongState) => {
        updateBall(state.ball);
        updateLeftPaddle(state.paddles[0].pos);
        updateRightPaddle(state.paddles[1].pos);
    };

    const resizeListener = () => renderer.resize();

    let countdownController: AbortController;

    const startRenderer = async () => {
        const { scene } = renderer;
        if (!scene) return log.error("Fail to start renderer: no active scene");

        if (renderer.bgmEnabled) renderer.audio.bgMusic.play();

        window.addEventListener("resize", resizeListener);
        renderer.runRenderLoop(() => scene.render());
        requestAnimationFrame(() => renderer.resize());
        handleShadows(renderer);

        await slideInCamera(scene);
        countdownController = new AbortController();
        await showCountdown(scene, countdownController.signal);
    };

    /** Destroy the current game session */
    const destroy = () => {
        // Destroy renderer related stuff
        disposeScene(renderer);
        renderer.stopRenderLoop();

        renderer.audio.bgMusic.stop();

        // Reset engine
        engine.stop();

        // Remove event listeners
        window.removeEventListener("resize", resizeListener);
        detachAllControls();
    };

    const startLocalGame = (mode: GameMode, config: PongConfig) => {
        engine.reset(config);
        mode === "ai" ? attachAiControl() : attachLocalControl();
        attachLocalEngineEvents(mode);
        startRenderer().then(engine.start);

        gameStore.update({ isPlaying: true, mode, status: "ongoing" });
    };

    // Actively start online game (host)
    const startOnlineGame = () => {
        attachOnlineControl();
        attachOnlineSocketEvents();
        startRenderer().then(sendRendererReady);

        gameStore.update({ isPlaying: true, mode: "online", status: "ongoing" });
    };

    const startGame = (mode: GameMode, config: PongConfig = defaultGameConfig) => {
        renderer.scene = createScene(renderer, config);

        hidePageElements();
        hideRouter();
        showCanvas();

        mode === "online" ? startOnlineGame() : startLocalGame(mode, config);
    };

    // Frontend handling of leaving game
    const endGame = () => {
        // User try to end the game when it is onging
        // if (status && status !== "ended") {
        //     const msg =
        //         mode === "online"
        //             ? "You will lose the current game, are you sure you want to leave?"
        //             : "The current game will be discarded, are you sure you want to leave?";
        //     const confirmed = confirm(msg);
        //     if (!confirmed) return false;

        //     if (mode === "online") sendApiRequest.post(CONST.API.LEAVE);
        // }

        hideCanvas();
        destroy();

        sendApiRequest.post(CONST.API.LEAVE);

        // Reset game store
        gameStore.update({
            isPlaying: false,
            mode: null,
            status: null,
            playerNames: ["", ""],
            lobbyId: "",
            lobbyHost: false,
        });
    };

    return { startGame, endGame };
};
