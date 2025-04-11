import {
    Animation,
    ArcRotateCamera,
    Color3,
    DirectionalLight,
    PBRMaterial,
    Scene,
    Vector3,
} from "@babylonjs/core";

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
