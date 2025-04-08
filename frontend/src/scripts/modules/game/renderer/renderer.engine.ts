import { Engine, GlowLayer, Scene } from "@babylonjs/core";
import { createEl } from "../../../utils/dom-helper";
import { createAudioEngine } from "./renderer.audio";
import { createCamera } from "./renderer.camera";
import { createControls } from "./renderer.controls";
import { createDirectionalLight, createHemisphericLight } from "./renderer.light";
import { createObjects } from "./renderer.objects";
import { createScene } from "./renderer.scene";
import { createShadowGenerator } from "./renderer.shadow";

/**
 * Engine will be initilized only once. Canvas element is persisted. So it's less expensive.
 */
export const createRendererEngine = async (canvasEl: HTMLCanvasElement) => {
    // const canvasEl = createEl("canvas", "w-full h-full", {
    //     attributes: { id: window.cfg.id.canvas },
    // });

    const engine = new Engine(canvasEl, true);
    const audioEngine = await createAudioEngine();

    // Initialize options
    engine.shadowsEnabled = false;
    engine.soundsEnabled = true;

    const scene = createScene(engine);
    const directionalLight = createDirectionalLight(scene);
    engine.shadowGenerator = createShadowGenerator(directionalLight);
    engine.camera = createCamera(engine, scene); // TODO: check if attaching camera is needed

    createHemisphericLight(scene);
    createControls(engine, audioEngine);
    createObjects(scene);
};
