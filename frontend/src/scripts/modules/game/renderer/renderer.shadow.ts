import { type DirectionalLight, ShadowGenerator } from "@babylonjs/core";

export const createShadowGenerator = (light: DirectionalLight): ShadowGenerator => {
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.setDarkness(0.2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 6;

    return shadowGenerator;
};
