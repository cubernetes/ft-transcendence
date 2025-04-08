import { Engine } from "@babylonjs/core";
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
export const createRendererEngine = async (canvasEl: HTMLCanvasElement): Promise<Engine> => {
    // const canvasEl = createEl("canvas", "w-full h-full", {
    //     attributes: { id: window.cfg.id.canvas },
    // });

    const engine = new Engine(canvasEl, true);
    const audioEngine = await createAudioEngine();
    engine.audio = audioEngine;

    // Initialize options
    engine.shadowsEnabled = false;
    engine.soundsEnabled = true;

    const scene = createScene(engine);
    const directionalLight = createDirectionalLight(scene);
    engine.shadowGenerator = createShadowGenerator(directionalLight);
    engine.camera = createCamera(engine, scene); // TODO: check if attaching camera is needed

    createHemisphericLight(scene);
    createControls(engine, audioEngine);
    createObjects(engine, scene);

    return engine;
    // These should be on page!!
    // Start rendering
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Destory this properly
    window.addEventListener("resize", () => engine.resize());
};
