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
} from "@babylonjs/core";
import { WebSocketManager } from "./managers/managers.sockets";
import { GameStateManager } from "./managers/managers.state";
import { SceneSetup } from "./game.scene";

export class GameInstance {
    private static instance: GameInstance;
    public engine: Engine;
    public scene: Scene;
    public audioEngine!: AudioEngineV2;
    public bgMusic!: StreamingSound;
    public hitSound!: StaticSound;
    public bounceSound!: StaticSound;
    public blopSound!: StaticSound;
    public camera: ArcRotateCamera;
    public board!: Mesh;
    public ball!: Mesh;
    public paddle1!: Mesh;
    public paddle2!: Mesh;
    private gameStateManager: GameStateManager;
    private webSocketManager: WebSocketManager;

    private constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        this.scene.audioEnabled = true;

        this.camera = SceneSetup.setCamera(this.scene);

        this.gameStateManager = new GameStateManager();
        this.webSocketManager = new WebSocketManager(this.gameStateManager);

        SceneSetup.setupScene(this.scene);
    }
    // Static async initialization method
    public static async getInstance(canvas: HTMLCanvasElement): Promise<GameInstance> {
        if (!GameInstance.instance) {
            GameInstance.instance = new GameInstance(canvas);

            // Wait for async operations here
            const { audioEngine, bgMusic } = await SceneSetup.createAudio();
            GameInstance.instance.audioEngine = audioEngine;
            GameInstance.instance.bgMusic = bgMusic;

            const { hitSound, bounceSound, blopSound } = await SceneSetup.createSounds();
            GameInstance.instance.hitSound = hitSound;
            GameInstance.instance.bounceSound = bounceSound;
            GameInstance.instance.blopSound = blopSound;

            SceneSetup.setupScene(GameInstance.instance.scene);

            const { board, paddle1, paddle2, ball } = await SceneSetup.createGameObjects(
                GameInstance.instance.scene
            );
            GameInstance.instance.board = board;
            GameInstance.instance.paddle1 = paddle1;
            GameInstance.instance.paddle2 = paddle2;
            GameInstance.instance.ball = ball;

            GameInstance.instance.setupRenderLoop();
        }
        return GameInstance.instance;
    }

    private setupRenderLoop() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    getWebSocketManager() {
        return this.webSocketManager;
    }
}
