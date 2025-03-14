import {
    Mesh,
    Scene,
    StandardMaterial,
    Texture,
    MeshBuilder,
    ArcRotateCamera,
    Vector3,
    Color3,
} from "@babylonjs/core";
import { GAME_CONFIG } from "./GameConfig";

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
        skyboxMaterial.diffuseTexture = new Texture("./assets/sky-clouds-background.jpg", scene);
        skybox.material = skyboxMaterial;
        skybox.position.y = -1;

        scene.createDefaultLight();
    }

    static setCamera(scene: Scene): void {
        //TODO: check if Class TargetCamera makes more sense.
        const camera = new ArcRotateCamera(
            "pongCamera",
            -Math.PI / 2, // alpha - side view (fixed)
            0.1, // beta - slightly above (fixed)
            25, // radius - distance from center
            Vector3.Zero(), // target - looking at center
            scene
        );
        // Disable keyboard controls
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        camera.inputs.clear();
    }

    static createGameObjects(scene: Scene): {
        board: Mesh;
        paddle1: Mesh;
        paddle2: Mesh;
        ball: Mesh;
    } {
        // Define consts
        const objectConfigs = GAME_CONFIG.objectConfigs;
        const positions = GAME_CONFIG.positions;
        const rotations = GAME_CONFIG.rotations;
        const materials = GAME_CONFIG.materials;
        const boardMaterial = new StandardMaterial("board", scene);
        const paddleMaterial = new StandardMaterial("paddle", scene);
        const ballMaterial = new StandardMaterial("ball", scene);

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

        // Create paddles
        const paddle1 = MeshBuilder.CreateBox(
            "paddle1",
            {
                width: objectConfigs.PADDLE_WIDTH,
                height: objectConfigs.PADDLE_HEIGHT,
                depth: objectConfigs.PADDLE_DEPTH,
            },
            scene
        );
        paddle1.position = positions.PADDLE1;
        paddle1.rotation.x = rotations.PADDLE1;
        paddleMaterial.diffuseColor = materials.PADDLE1.diffuseColor;
        paddle1.material = paddleMaterial;

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
