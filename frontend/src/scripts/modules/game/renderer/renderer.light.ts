import {
    Animation,
    DirectionalLight,
    Engine,
    HemisphericLight,
    Mesh,
    type Scene,
    ShadowGenerator,
    Vector3,
} from "@babylonjs/core";
import { Button } from "@babylonjs/gui";

export const createDirectionalLight = (scene: Scene): DirectionalLight => {
    const name = CONST.NAME.DLIGHT;
    const vec = new Vector3(0, -4, 0);
    const config = { intensity: 1.0, shadowMinZ: 3.5, shadowMaxZ: 15, shadowsEnabled: true };

    const light = new DirectionalLight(name, vec, scene);
    Object.assign(light, config);

    createShadowGenerator(light);

    return light;
};

export const createHemisphericLight = (scene: Scene): HemisphericLight => {
    const name = CONST.NAME.HLIGHT;
    const vec = new Vector3(0, 1, 0);
    const config = { intensity: 0.5 };

    const light = new HemisphericLight(name, vec, scene);
    Object.assign(light, config);

    return light;
};

const createShadowGenerator = (light: DirectionalLight): ShadowGenerator => {
    const config = {
        setDarkness: 0.2,
        useBlurExponentialShadowMap: true,
        useKernelBlur: true,
        blurKernel: 6,
    };

    const shadowGenerator = new ShadowGenerator(1024, light);
    Object.assign(shadowGenerator, config);

    return shadowGenerator;
};

export const handleShadows = (renderer: Engine) => {
    const { scene } = renderer;
    if (!scene) return log.warn("Fail to cast shadows: no active scene");

    const ball = scene.getMeshByName(CONST.NAME.BALL)! as Mesh;
    const lpaddle = scene.getMeshByName(CONST.NAME.LPADDLE)! as Mesh;
    const rpaddle = scene.getMeshByName(CONST.NAME.RPADDLE)! as Mesh;
    const objs = [ball, lpaddle, rpaddle];

    const light = scene.getLightByName(CONST.NAME.DLIGHT)! as DirectionalLight;
    const generator = light.getShadowGenerator()! as ShadowGenerator;
    renderer.shadowsEnabled
        ? objs.forEach((obj) => generator.addShadowCaster(obj))
        : generator.getShadowMap()?.renderList?.splice(0);
};

export const toggleShadows = (renderer: Engine) => {
    if (renderer.shadowsEnabled) {
        renderer.shadowsEnabled = false;
        localStorage.setItem(CONST.KEY.SHADOWS, "0");
    } else {
        renderer.shadowsEnabled = true;
        localStorage.setItem(CONST.KEY.SHADOWS, "1");
    }

    handleShadows(renderer);
};

export const pulseLight = (scene: Scene) => {
    const light = scene.getLightByName(CONST.NAME.DLIGHT)!;

    if (!light.animations) {
        light.animations = []; // Initialize if null
    }

    let anim = light.animations.find((anim) => anim.name === "lightPulse");

    if (!anim) {
        const flashAnim = new Animation(
            "lightPulse",
            "intensity",
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        flashAnim.setKeys([
            { frame: 0, value: light.intensity },
            { frame: 5, value: 5 },
            { frame: 10, value: light.intensity },
            { frame: 15, value: 10 },
            { frame: 20, value: light.intensity },
        ]);
        light.animations.push(flashAnim);
    }

    scene.beginAnimation(light, 0, 20, false);
};
