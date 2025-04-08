import {
    ArcRotateCamera,
    DirectionalLight,
    type Engine,
    Scene,
    ShadowGenerator,
    Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

export const createShadowGenerator = (light: DirectionalLight) => {
    // --------- SHADOWS
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.setDarkness(0.5);
    // shadowGenerator.useBlurExponentialShadowMap = true;
    // shadowGenerator.forceBackFacesOnly = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 64;
    // shadowGenerator.useExponentialShadowMap = true;
    return shadowGenerator;
};

export const createDirectionalLight = (scene: Scene) => {
    // Config
    const name = "directionalLight";
    const vec = new Vector3(0, -8, 4);

    const light = new DirectionalLight(name, vec, scene);

    // light.intensity = 0.5;
    light.shadowMinZ = 3.5;
    light.shadowMaxZ = 15;
    // light.shadowEnabled
    // light.autoUpdateExtends = false;
    // light.autoCalcShadowZBounds = true;

    return light;
};

export const setupCamera = (engine: Engine, scene: Scene) => {
    //TODO: check if Class TargetCamera makes more sense.
    const camera = new ArcRotateCamera(
        "pongCamera",
        -Math.PI / 2, // alpha - side view (fixed)
        0.1, // beta - slightly above (fixed)
        25, // radius - distance from center
        Vector3.Zero(), // target - looking at center
        scene
    );

    // Set limits for zooming in/out
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 40;
    // Set limits for rotation up/down
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2;
    // Set limits for rotation left/right
    camera.upperAlphaLimit = 0;
    camera.lowerAlphaLimit = -Math.PI;

    // Disable keyboard controls
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    // camera.inputs.clear();
    camera.attachControl(engine.getRenderingCanvas(), true);

    return camera;
};

export const createScene = (engine: Engine) => {
    // --------- SCENE
    const scene = new Scene(engine);
    scene.audioEnabled = true; // This doesn't seem to be official, separate for audio engine?

    const light = createDirectionalLight(scene);
    const shadowGenerator = createShadowGenerator(light);
    const camera = setupCamera(engine, scene);
    return scene;
};
