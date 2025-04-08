import { Engine, Scene } from "@babylonjs/core";
import { createEl } from "../../../utils/dom-helper";
import { createAudioEngine } from "./renderer.audio";
import { createControls } from "./renderer.controls";
import { createObjects } from "./renderer.objects";
import {
    createDirectionalLight,
    createScene,
    createShadowGenerator,
    setupCamera,
} from "./renderer.scene";

/**
 * Engine will be initilized only once. Canvas element is persisted. So it's less expensive.
 */
export const createRendererEngine = async (canvasEl: HTMLCanvasElement) => {
    // const canvasEl = createEl("canvas", "w-full h-full", {
    //     attributes: { id: window.cfg.id.canvas },
    // });

    const engine = new Engine(canvasEl, true);

    const scene = new Scene(engine);
    scene.audioEnabled = true; // This doesn't seem to be official, separate for audio engine?

    const light = createDirectionalLight(scene);
    const shadowGenerator = createShadowGenerator(light);
    const camera = setupCamera(engine, scene); // Change to create
    const audio = await createAudioEngine();

    // An array of mesh/game objcts
    const objs = createObjects();

    // Shadow enabled for last objs
    const controls = createControls(shadowGenerator, audio, objs);
    // createControls
};
