import {
    Animation,
    ArcRotateCamera,
    Color3,
    DirectionalLight,
    DynamicTexture,
    MeshBuilder,
    PBRMaterial,
    Scene,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";

export const slideInCamera = async (camera: ArcRotateCamera, scene: Scene) => {
    // ----- CAMERA SLIDE-IN ANIMATION -----
    // ------------ RADIUS
    const radAnim = new Animation("animCam", "radius", 15, Animation.ANIMATIONTYPE_FLOAT);
    const radKeysPosition = [];
    radKeysPosition.push({
        frame: 0,
        value: 200,
    });
    radKeysPosition.push({
        frame: 80,
        value: 40,
    });
    radKeysPosition.push({
        frame: 100,
        value: 25,
    });
    radAnim.setKeys(radKeysPosition);
    camera.animations.push(radAnim);

    // ------------ ALPHA
    const alphaAnim = new Animation("animCam", "alpha", 15, Animation.ANIMATIONTYPE_FLOAT);
    const alphaKeysPosition = [];
    alphaKeysPosition.push({
        frame: 0,
        value: -Math.PI,
    });
    alphaKeysPosition.push({
        frame: 50,
        value: 0,
    });
    alphaKeysPosition.push({
        frame: 100,
        value: -Math.PI / 2,
    });
    alphaAnim.setKeys(alphaKeysPosition);
    camera.animations.push(alphaAnim);

    const setCameraLimits = (): void => {
        // Set limits for zooming in/out
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 40;
        // Set limits for rotation up/down
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = Math.PI / 2;
        // Set limits for rotation left/right
        camera.upperAlphaLimit = 0;
        camera.lowerAlphaLimit = -Math.PI;
    };

    // Wait for animation to finish so that game can start after
    await scene.beginAnimation(camera, 0, 100, false, 1.0, setCameraLimits).waitAsync();
};

export const shakeCamera = (camera: ArcRotateCamera, scene: Scene) => {
    if (!camera.animations) {
        camera.animations = []; // Initialize
    }

    let shakeAnim = camera.animations.find((anim) => anim.name === "shake");

    if (!shakeAnim) {
        shakeAnim = new Animation(
            "shake",
            "position",
            60,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );
        // shakeAnim.enableBlending = true;
        camera.animations.push(shakeAnim);
    }
    const start = camera.position.clone();
    const keys = [];

    for (let i = 0; i <= 5; i++) {
        keys.push({
            frame: i * 2,
            value: start.addInPlace(
                new Vector3(
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3
                )
            ),
        });
    }
    keys.push({ frame: 12, value: start });

    shakeAnim.setKeys(keys);

    scene.beginAnimation(camera, 0, 12, false, 3);
};

export const pulseLight = (light: DirectionalLight, scene: Scene) => {
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

export const pulseBall = (material: PBRMaterial, scene: Scene) => {
    if (!material.animations) {
        material.animations = []; // Initialize if null
    }

    let anim = material.animations.find((anim) => anim.name === "glow");

    if (!anim) {
        anim = new Animation("glow", "emissiveColor", 60, Animation.ANIMATIONTYPE_COLOR3);

        anim.setKeys([
            { frame: 0, value: Color3.Black() },
            { frame: 3, value: new Color3(0, 0.7, 0.5) },
            { frame: 6, value: new Color3(0.7, 0, 0.5) },
            { frame: 10, value: Color3.Black() },
        ]);

        material.animations.push(anim);
    }

    scene.beginAnimation(material, 0, 10, false);
};
