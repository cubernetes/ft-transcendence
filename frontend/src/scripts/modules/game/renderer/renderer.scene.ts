import {
    Axis,
    BackgroundMaterial,
    CubeTexture,
    Engine,
    GlowLayer,
    Mesh,
    MeshBuilder,
    Scene,
    Space,
    Texture,
} from "@babylonjs/core";
import { PongConfig } from "@darrenkuro/pong-core";
import { createBall } from "../objects/objects.ball";
import { createBoard } from "../objects/objects.board";
import { createPaddles } from "../objects/objects.paddle";
import { createScore } from "../objects/objects.score";
import { createWalls } from "../objects/objects.wall";
import { createCamera } from "./renderer.camera";
import { createControls } from "./renderer.controls";
import { createDirectionalLight, createHemisphericLight } from "./renderer.light";

const setupScene = (scene: Scene) => {
    // ---------------- SKYBOX
    const sky = new BackgroundMaterial("skyMaterial", scene);
    sky.backFaceCulling = false;
    sky.reflectionTexture = new CubeTexture(`${CONST.DIR.ASSET}/skybox/`, scene, [
        "px.png",
        "py.png",
        "pz.png",
        "nx.png",
        "ny.png",
        "nz.png",
    ]);
    // scene.environmentTexture = sky.reflectionTexture;
    sky.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    const skydome = MeshBuilder.CreateBox(
        "sky",
        {
            size: 1000,
            sideOrientation: Mesh.BACKSIDE,
        },
        scene
    );
    // skydome.infiniteDistance = true;
    skydome.material = sky;
    skydome.rotate(Axis.Y, Math.PI, Space.LOCAL);
};

export const createScene = (engine: Engine, config: PongConfig): Scene => {
    const scene = new Scene(engine);

    engine.scene = scene;
    engine.scene.audioEnabled = true; // This doesn't seem to be official, separate for audio engine?
    // scene.environmentIntensity = 0.5;
    const glow = new GlowLayer("glow", engine.scene);
    glow.intensity = 5;

    setupScene(engine.scene);

    createDirectionalLight(engine.scene);
    createHemisphericLight(engine.scene);
    createCamera(engine.scene);
    createControls(engine);

    // Create board, standrize to scene, config
    createBoard(scene, config);
    createWalls(scene, config.board.size);
    createPaddles(scene, config);
    createScore(scene, config);

    const ball = createBall(scene, config);
    engine.audio.hitSound.spatial.attach(ball);
    engine.audio.bounceSound.spatial.attach(ball);
    engine.audio.blopSound.spatial.attach(ball);
    engine.audio.ballSound.spatial.attach(ball);
    return scene;
};
