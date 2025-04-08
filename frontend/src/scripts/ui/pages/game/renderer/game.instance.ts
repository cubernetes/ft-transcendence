import {
    ArcRotateCamera,
    AudioEngineV2,
    DirectionalLight,
    Engine,
    IFontData,
    Mesh,
    Scene,
    ShadowGenerator,
    StaticSound,
    StreamingSound,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { BabylonObjects, ICollisionEvent } from "../game.types";
import { WebSocketManager } from "../managers/managers.sockets";
import { GameStateManager } from "../managers/managers.state";
import { SceneSetup } from "./game.renderer";

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
            soundsEnabled: true,
            camera: {} as ArcRotateCamera,
            board: {} as Mesh,
            ball: {} as Mesh,
            paddle1: {} as Mesh,
            paddle2: {} as Mesh,
            fontData: {} as IFontData,
        };
        SceneSetup.createScene(this.babylon);
        SceneSetup.setCamera(this.babylon);
        SceneSetup.setupScene(this.babylon.scene);
    }

    public static async getInstance(canvas: HTMLCanvasElement): Promise<GameInstance> {
        if (!GameInstance.instance) {
            GameInstance.instance = new GameInstance(canvas);

            await SceneSetup.createAudio(GameInstance.instance.babylon);

            await SceneSetup.createSounds(GameInstance.instance.babylon);

            await SceneSetup.createGameObjects(GameInstance.instance.babylon);

            // GameInstance.instance.babylon.fontData = (await (
            //     await fetch(`${window.cfg.dir.assets}/Montserrat_Regular.json`)
            // ).json()) as IFontData;

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

    // TODO: Change y-position in backend so it fits the paddles
    updateBallPosition(x: number, y: number, z: number) {
        this.babylon.ball.position.set(x, y, z);
    }

    updateLeftPaddlePosition(x: number, y: number, z: number) {
        this.babylon.paddle1.position.set(x, y, z);
    }

    updateRightPaddlePosition(x: number, y: number, z: number) {
        this.babylon.paddle2.position.set(x, y, z);
    }

    updateScore(score: [number, number]) {
        // Update score text
        // this.babylon.scoreText.text = `Score: ${score.player1} - ${score.player2}`;
        window.log.info(`Score updated: ${score[0]} - ${score[1]}`);
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

    handleScore() {
        if (this.babylon.soundsEnabled) {
            this.babylon.blopSound.play();
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
