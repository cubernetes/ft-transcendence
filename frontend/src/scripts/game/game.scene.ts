import {
    Mesh,
    Scene,
    StandardMaterial,
    Texture,
    MeshBuilder,
    ArcRotateCamera,
    Vector3,
    Color3,
    Material,
    CreateAudioEngineAsync,
    CreateSoundAsync,
    Sound,
    CreateStreamingSoundAsync,
    StaticSound,
    StreamingSound,
    AudioEngineV2,
} from "@babylonjs/core";

import { getObjectConfigs, gameConfig, ObjectConfig } from "./game.config";
import { ASSETS_DIR } from "../config";

export class SceneSetup {
    static setupScene(scene: Scene): void {
        // Create a background
        const skybox = MeshBuilder.CreateBox(
            "skybox",
            {
                width: 100,
                height: 0.1,
                depth: 100,
            },
            scene
        );
        const skyboxMaterial = new StandardMaterial("skyboxMaterial", scene);
        skyboxMaterial.diffuseTexture = new Texture(
            `${ASSETS_DIR}/sky-clouds-background.jpg`,
            scene
        );
        skybox.material = skyboxMaterial;
        skybox.position.y = -1;

        scene.createDefaultLight();
    }

    // TODO: Check if audioEngine works like this
    static async createAudio(): Promise<{
        audioEngine: AudioEngineV2;
        bgMusic: StreamingSound;
    }> {
        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlock();
        await audioEngine.createMainBusAsync("mainBus", { volume: 0.5 });

        const soundStream = await CreateStreamingSoundAsync(
            "bgMusic",
            `${ASSETS_DIR}/neon-gaming.mp3`,
            {
                loop: true,
                autoplay: true,
                volume: 0.5,
            },
            audioEngine
        );
        return { audioEngine, bgMusic };
    }

    static async createSounds(): Promise<{
        hitSound: StaticSound;
        bounceSound: StaticSound;
        blopSound: StaticSound;
    }> {
        const hitSound = await CreateSoundAsync("hitSound", `${ASSETS_DIR}/hit.mp3`);
        hitSound.volume = 0.1;
        const bounceSound = await CreateSoundAsync("bounceSound", `${ASSETS_DIR}/bounce.mp3`);
        bounceSound.volume = 0.1;
        const blopSound = await CreateSoundAsync("blopSound", `${ASSETS_DIR}/blop.mp3`);
        blopSound.pitch = 1.5;

        return { hitSound, bounceSound, blopSound };
    }

    static createFunctions(scene: Scene): void {
        // scene.onPointerDown = function castRay() {
        //     const picked = scene.pick(scene.pointerX, scene.pointerY);
        //     if (picked.pickedMesh) {
        //         blopSound.play();
        //     }
        // }

        // Create a function to handle window resizing
        window.addEventListener("resize", () => {
            scene.getEngine().resize();
        });

        // Create a function to handle window closing
        window.addEventListener("beforeunload", () => {
            scene.dispose();
        });
    }

    static setCamera(scene: Scene): ArcRotateCamera {
        //TODO: check if Class TargetCamera makes more sense.
        const camera = new ArcRotateCamera(
            "pongCamera",
            -Math.PI / 2, // alpha - side view (fixed)
            0.7, // beta - slightly above (fixed)
            25, // radius - distance from center
            Vector3.Zero(), // target - looking at center
            scene
        );
        // Set limits for zooming in/out
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 40;
        // Set limits for rotation up/down
        camera.lowerBetaLimit = 0.5;
        camera.upperBetaLimit = Math.PI / 2 - 0.1;
        // Set limits for rotation left/right
        camera.upperAlphaLimit = -0.2;
        camera.lowerAlphaLimit = -Math.PI + 0.2;

        // Disable keyboard controls
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        // camera.inputs.clear();
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

        return camera;
    }

    static async createGameObjects(scene: Scene): Promise<{
        board: Mesh;
        paddle1: Mesh;
        paddle2: Mesh;
        ball: Mesh;
    }> {
        const objectConfigs = (await (await getObjectConfigs()).json())
            .data as unknown as ObjectConfig;

        // Define consts
        const positions = gameConfig.positions;
        const rotations = gameConfig.rotations;
        const materials = gameConfig.materials;
        const boardMaterial = new StandardMaterial("board", scene);
        const paddleMaterial = new StandardMaterial("paddle", scene);

        const ballMaterial = new StandardMaterial("ball", scene);
        // ballMaterial.wireframe = true;

        const paddleMaterial2 = new StandardMaterial("paddle1Mat", scene);
        paddleMaterial2.alpha = 0.5;
        paddleMaterial2.alphaMode = Material.MATERIAL_ALPHABLEND;
        paddleMaterial2.diffuseColor = new Color3(0, 0, 1);
        paddleMaterial2.backFaceCulling = false;

        // Create game board
        const board = MeshBuilder.CreateBox(
            "board",
            {
                width: objectConfigs.BOARD_WIDTH,
                height: objectConfigs.BOARD_HEIGHT,
                depth: objectConfigs.BOARD_DEPTH,
            },
            scene
        );
        board.position = positions.BOARD;
        boardMaterial.diffuseColor = materials.BOARD.diffuseColor;
        boardMaterial.specularColor = materials.BOARD.specularColor;
        board.material = boardMaterial;

        const paddle1 = MeshBuilder.CreateSphere(
            "paddle1",
            {
                diameterX: objectConfigs.PADDLE_WIDTH,
                diameterY: objectConfigs.PADDLE_HEIGHT,
                diameterZ: objectConfigs.PADDLE_DEPTH,
            },
            scene
        );
        paddle1.position = positions.PADDLE1;
        paddle1.rotation.x = rotations.PADDLE1;
        paddleMaterial.diffuseColor = materials.PADDLE1.diffuseColor;
        paddle1.material = paddleMaterial2;

        const paddle2 = MeshBuilder.CreateBox(
            "paddle2",
            {
                width: objectConfigs.PADDLE_WIDTH,
                height: objectConfigs.PADDLE_HEIGHT,
                depth: objectConfigs.PADDLE_DEPTH,
            },
            scene
        );
        paddle2.position = positions.PADDLE2;
        paddle2.rotation.x = rotations.PADDLE2;
        paddleMaterial.diffuseColor = materials.PADDLE2.diffuseColor;
        paddle2.material = paddleMaterial;

        // Create ball
        const ball = MeshBuilder.CreateSphere(
            "ball",
            {
                segments: 5,
                diameter: objectConfigs.BALL_RADIUS * 2,
            },
            scene
        );
        ball.position = positions.BALL;
        ballMaterial.diffuseColor = materials.BALL.diffuseColor;
        ball.material = ballMaterial;

        return { board, paddle1, paddle2, ball };
    }
}
