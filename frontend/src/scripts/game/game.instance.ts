import {
    Engine,
    Scene,
    AudioEngineV2,
    StreamingSound,
    StaticSound,
    Mesh,
    FreeCamera,
    Vector3,
    ArcRotateCamera,
    IFontData,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { WebSocketManager } from "./managers/managers.sockets";
import { GameStateManager } from "./managers/managers.state";
import { SceneSetup } from "./game.scene";
import { ASSETS_DIR } from "../config";
import { ICollisionEvent, BabylonObjects } from "./game.types";

export class GameInstance {
    private gameStateManager: GameStateManager;
    private webSocketManager: WebSocketManager;

    private static instance: GameInstance | null = null;
    public babylon: BabylonObjects;

    private constructor(canvas: HTMLCanvasElement) {
        this.gameStateManager = new GameStateManager();
        this.webSocketManager = new WebSocketManager(this.gameStateManager); // TODO: and maybe this as argument ?

        const engine = new Engine(canvas, true);

        const { scene, controls, shadowGenerator } = SceneSetup.createScene(engine);

        this.babylon = {
            engine,
            scene,
            shadowGenerator,
            controls,
            audioEngine: {} as AudioEngineV2,
            bgMusic: {} as StreamingSound,
            hitSound: {} as StaticSound,
            bounceSound: {} as StaticSound,
            blopSound: {} as StaticSound,
            camera: SceneSetup.setCamera(scene),
            board: {} as Mesh,
            ball: {} as Mesh,
            paddle1: {} as Mesh,
            paddle2: {} as Mesh,
            fontData: {} as IFontData,
        };

        SceneSetup.setupScene(this.babylon.scene);
    }

    public static async getInstance(canvas: HTMLCanvasElement): Promise<GameInstance> {
        if (!GameInstance.instance) {
            GameInstance.instance = new GameInstance(canvas);

            const { audioEngine, bgMusic } = await SceneSetup.createAudio();
            Object.assign(GameInstance.instance.babylon, { audioEngine, bgMusic });

            const { hitSound, bounceSound, blopSound } = await SceneSetup.createSounds();
            Object.assign(GameInstance.instance.babylon, { hitSound, bounceSound, blopSound });

            const { board, paddle1, paddle2, ball } = await SceneSetup.createGameObjects(
                GameInstance.instance.babylon
            );
            Object.assign(GameInstance.instance.babylon, { board, paddle1, paddle2, ball });

            GameInstance.instance.babylon.fontData = (await (
                await fetch(`${ASSETS_DIR}/Montserrat_Regular.json`)
            ).json()) as IFontData;

            SceneSetup.createControls(
                GameInstance.instance.babylon.controls,
                GameInstance.instance.babylon.bgMusic
            );

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
        this.babylon.ball.position.set(x, 0.5, z);
    }

    updateLeftPaddlePosition(x: number, y: number, z: number) {
        this.babylon.paddle1.position.set(x, y, z);
    }

    updateRightPaddlePosition(x: number, y: number, z: number) {
        this.babylon.paddle2.position.set(x, y, z);
    }

    updateScore(score: { player1: number; player2: number }) {
        // Update score text
        // this.babylon.scoreText.text = `Score: ${score.player1} - ${score.player2}`;
        console.log(`Score updated: ${score.player1} - ${score.player2}`);
    }

    handleCollisionEvents(collisionEvents: ICollisionEvent[]) {
        collisionEvents.forEach((event) => {
            switch (event.type) {
                case "paddle":
                    this.babylon.hitSound.play();
                    break;
                case "wall":
                    this.babylon.bounceSound.play();
                    break;
                case "score":
                    this.babylon.blopSound.play();
                    break;
                default:
                    console.warn(`Unknown collision event type: ${event.type}`);
            }
        });
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
