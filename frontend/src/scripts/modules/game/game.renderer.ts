import { Result, err, ok } from "neverthrow";
import { Engine } from "@babylonjs/core";
import { createAudioEngine } from "./renderer/renderer.audio";

export const createRenderer = async (
    canvasEl: HTMLCanvasElement
): Promise<Result<Engine, string>> => {
    // Try to initialize audio engine, which is independent of scene
    const tryCreateAudioEngine = await createAudioEngine();
    if (tryCreateAudioEngine.isErr()) return err(tryCreateAudioEngine.error);

    const renderer = new Engine(canvasEl, true);
    renderer.audio = tryCreateAudioEngine.value;

    // Initialize options
    const { SHADOWS, SFX, BGM } = CONST.KEY;
    renderer.shadowsEnabled = localStorage.getItem(SHADOWS) !== "0"; // Default true
    renderer.sfxEnabled = localStorage.getItem(SFX) !== "0"; // Default true
    renderer.bgmEnabled = localStorage.getItem(BGM) !== "0"; // Default true

    return ok(renderer);
};

export const disposeScene = (engine: Engine) => {
    if (engine.scene) {
        engine.scene.dispose();
        delete engine.scene;
    }
};
