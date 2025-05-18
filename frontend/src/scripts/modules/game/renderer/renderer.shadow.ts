import { Engine, ShadowGenerator } from "@babylonjs/core";

export const createShadowGenerator = (engine: Engine): ShadowGenerator => {
    const shadowGenerator = new ShadowGenerator(1024, engine.directionalLight);
    shadowGenerator.setDarkness(0.2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 6;

    engine.castShadow = () => {
        engine.shadowGenerator.addShadowCaster(engine.leftPaddle);
        engine.shadowGenerator.addShadowCaster(engine.rightPaddle);
        engine.shadowGenerator.addShadowCaster(engine.ball);
    };

    return shadowGenerator;
};
