import { DirectionalLight, HemisphericLight, type Scene, Vector3 } from "@babylonjs/core";

export const createDirectionalLight = (scene: Scene): DirectionalLight => {
    // Config
    const name = "directionalLight";
    const vec = new Vector3(0, -4, 0);

    const light = new DirectionalLight(name, vec, scene);

    light.intensity = 1.0;
    light.shadowMinZ = 3.5;
    light.shadowMaxZ = 15;
    light.shadowEnabled;
    // light.autoUpdateExtends = false;
    // light.autoCalcShadowZBounds = true;

    return light;
};

export const createHemisphericLight = (scene: Scene): HemisphericLight => {
    // Config
    const name = "hemiLight";
    const vec = new Vector3(0, 1, 0);

    const hemiLight = new HemisphericLight(name, vec, scene);

    hemiLight.intensity = 0.5;
    return hemiLight;
};
