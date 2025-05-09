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
import { createCamera } from "./renderer.camera";
import { createControls } from "./renderer.controls";
import { createDirectionalLight, createHemisphericLight } from "./renderer.light";
import { createObjects } from "./renderer.objects";
import { createShadowGenerator } from "./renderer.shadow";

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
    engine.scene = new Scene(engine);
    engine.scene.audioEnabled = true; // This doesn't seem to be official, separate for audio engine?
    // scene.environmentIntensity = 0.5;
    const glow = new GlowLayer("glow", engine.scene);
    glow.intensity = 5;

    setupScene(engine.scene);

    engine.directionalLight = createDirectionalLight(engine.scene);
    engine.shadowGenerator = createShadowGenerator(engine.directionalLight);
    engine.camera = createCamera(engine); // TODO: check if attaching camera is needed
    engine.controls = createControls(engine);

    createHemisphericLight(engine.scene);
    createObjects(engine, config);

    return engine.scene;
};
