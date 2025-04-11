import { Engine } from "@babylonjs/core";
import { createAudioEngine } from "./renderer/renderer.audio";

/**
 * Maybe engine should be initilized only once. Canvas element is persisted. So it's less expensive?
 */
export const createRenderer = async (canvasEl: HTMLCanvasElement): Promise<Engine> => {
    const engine = new Engine(canvasEl, true); // persist
    engine.audio = await createAudioEngine(); // persist

    // Initialize options
    engine.shadowsEnabled = false;
    engine.soundsEnabled = true;

    return engine;
};

export const disposeScene = (engine: Engine) => {
    if (engine.scene) {
        engine.scene.dispose();
    }
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
