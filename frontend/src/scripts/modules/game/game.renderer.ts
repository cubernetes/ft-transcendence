import { Engine } from "@babylonjs/core";
import { createAudioEngine } from "./renderer/renderer.audio";
import { createCamera } from "./renderer/renderer.camera";
import { createControls } from "./renderer/renderer.controls";
import { createDirectionalLight, createHemisphericLight } from "./renderer/renderer.light";
import { createObjects } from "./renderer/renderer.objects";
import { createScene } from "./renderer/renderer.scene";
import { createShadowGenerator } from "./renderer/renderer.shadow";

/**
 * Maybe engine should be initilized only once. Canvas element is persisted. So it's less expensive?
 */
export const createRenderer = async (canvasEl: HTMLCanvasElement): Promise<Engine> => {
    const engine = new Engine(canvasEl, true);
    const audioEngine = await createAudioEngine();
    engine.audio = audioEngine;

    // Initialize options
    engine.shadowsEnabled = false;
    engine.soundsEnabled = true;

    const scene = createScene(engine);
    engine.scene = scene;
    const directionalLight = createDirectionalLight(scene);
    engine.directionalLight = directionalLight;
    engine.shadowGenerator = createShadowGenerator(directionalLight);
    engine.camera = createCamera(engine, scene); // TODO: check if attaching camera is needed
    engine.controls = createControls(engine, audioEngine);

    createHemisphericLight(scene);
    createObjects(engine, scene);

    return engine;
};

/** Dispose everything in a renderer engine */
export const disposeRenderer = (engine: Engine) => {
    engine.audio.bgMusic.dispose();
    engine.audio.ballSound.dispose();
    engine.audio.bounceSound.dispose();
    engine.audio.blopSound.dispose();
    engine.audio.hitSound.dispose();
    engine.audio.dispose();

    engine.scene.dispose();
    engine.controls.dispose();
    engine.stopRenderLoop();
    engine.dispose();
};
