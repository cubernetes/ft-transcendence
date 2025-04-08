import {
    ArcRotateCamera,
    AudioEngineV2,
    DirectionalLight,
    Engine,
    IFontData,
    Mesh,
    Quaternion,
    Scene,
    ShadowGenerator,
    StaticSound,
    StreamingSound,
    Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { Ball } from "@darrenkuro/pong-core";
import { SceneSetup } from "./game.scene";
import { BabylonObjects } from "./game.types";
import { WebSocketManager } from "./managers/managers.sockets";
import { GameStateManager } from "./managers/managers.state";

export class GameInstance {
    private gameStateManager: GameStateManager;
    private webSocketManager: WebSocketManager;

    private static instance: GameInstance | null = null;
    public babylon: BabylonObjects;

    private constructor(canvas: HTMLCanvasElement) {
        this.gameStateManager = new GameStateManager();
        this.webSocketManager = new WebSocketManager(this.gameStateManager); // TODO: and maybe this as argument ?

        const engine = new Engine(canvas, true);
        this.babylon = {
            engine,
            scene: {} as Scene,
            light: {} as DirectionalLight,
            shadowGenerator: {} as ShadowGenerator,
            shadowsEnabled: false,
            controls: {} as AdvancedDynamicTexture,
            audioEngine: {} as AudioEngineV2,
            bgMusic: {} as StreamingSound,
            hitSound: {} as StaticSound,
            bounceSound: {} as StaticSound,
            blopSound: {} as StaticSound,
            ballSound: {} as StaticSound,
            soundsEnabled: true,
            camera: {} as ArcRotateCamera,
            board: {} as Mesh,
            score: null,
            fontData: {} as IFontData,
            ball: {} as Mesh,
            paddle1: {} as Mesh,
            paddle2: {} as Mesh,
        };
        SceneSetup.createScene(this.babylon);
        SceneSetup.setCamera(this.babylon);
        SceneSetup.setupScene(this.babylon.scene);
    }

    public static async getInstance(canvas: HTMLCanvasElement): Promise<GameInstance> {
        if (!GameInstance.instance) {
            GameInstance.instance = new GameInstance(canvas);

            await SceneSetup.createAudio(GameInstance.instance.babylon);

            await SceneSetup.createGameObjects(GameInstance.instance.babylon);

            SceneSetup.createControls(GameInstance.instance.babylon);

            GameInstance.instance.setupRenderLoop();
        }
        return GameInstance.instance;
    }

    public static destroyInstance() {
        if (GameInstance.instance) {
            GameInstance.instance.babylon.engine.dispose();
            GameInstance.instance = null;
        }
    }

    // TODO: Change y-position (up/down) in backend so it fits the paddles
    updateBall(oldBall: Ball, newBall: Ball) {
        // ------ POSITION:
        this.babylon.ball.position.set(newBall.pos.x, newBall.pos.y, newBall.pos.z);

        // ------ ROTATION:
        // ------ Movement in XZ-plane:
        const dx = newBall.pos.x - oldBall.pos.x;
        const dz = newBall.pos.z - oldBall.pos.z;
        const distance = Math.hypot(dx, dz);
        const angle = distance / newBall.r;
        const axis = new Vector3(-dz, 0.5, dx).normalize();

        // Convert angle+axis to quaternion
        const q = Quaternion.RotationAxis(axis, angle);
        this.babylon.ball.rotationQuaternion = q.multiply(this.babylon.ball.rotationQuaternion!);
    }

    updateLeftPaddle(x: number, y: number, z: number) {
        this.babylon.paddle1.position.set(x, y, z);
    }

    updateRightPaddle(x: number, y: number, z: number) {
        this.babylon.paddle2.position.set(x, y, z);
    }

    updateScore(score: [number, number]) {
        SceneSetup.createScore(score, this.babylon);
        if (this.babylon.soundsEnabled) {
            this.babylon.ballSound.play();
        }
        SceneSetup.pulseLight(this.babylon, 15);
        // SceneSetup.blinkScore(this.babylon, score);  // TODO: OR blink the score?
        console.log(`Score updated: ${score[0]} - ${score[1]}`);
    }

    handleWallCollision() {
        if (this.babylon.soundsEnabled) {
            this.babylon.bounceSound.play();
        }
    }

    handlePaddleCollision() {
        if (this.babylon.soundsEnabled) {
            this.babylon.hitSound.play();
        }
    }

    handleBallReset() {
        if (this.babylon.soundsEnabled) {
            this.babylon.ballSound.play();
        }
    }

    private setupRenderLoop() {
        this.webSocketManager.setupSocketHandlers();

        this.babylon.engine.runRenderLoop(() => {
            this.babylon.scene.render();
        });

        window.addEventListener("resize", () => {
            this.babylon.engine.resize();
        });
    }

    getWebSocketManager() {
        return this.webSocketManager;
    }
}
