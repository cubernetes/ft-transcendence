import { Animation, ArcRotateCamera, type Scene, Vector3 } from "@babylonjs/core";

export const createCamera = (scene: Scene): ArcRotateCamera => {
    const camera = new ArcRotateCamera(
        CONST.NAME.CAMERA,
        -Math.PI / 2, // alpha - side view (fixed)
        Math.PI / 4,
        200, // radius - distance from center
        Vector3.Zero(), // target - looking at center
        scene,
        true
    );

    // Attach control but ones with disable keyboard to not interfere
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    camera.attachControl(true);

    return camera;
};

export const slideInCamera = async (scene: Scene) => {
    const camera = scene.activeCamera! as ArcRotateCamera;

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
    const keys = [];
	const shakeFrames = 10;
    const shakeStrength = 0.2;
    const start = camera.position.clone();

    for (let i = 0; i < shakeFrames; i++) {
        const direction = new Vector3(
            (Math.random() - 0.5) * shakeStrength,
            (Math.random() - 0.5) * shakeStrength,
            (Math.random() - 0.5) * shakeStrength
        );
        keys.push({
            frame: i * 2,
            value: start.add(direction),
        });
    }
    keys.push({ frame: shakeFrames * 2, value: start });

    shakeAnim.setKeys(keys);

    scene.beginAnimation(camera, 0, shakeFrames * 2, false, 3, () => {
		camera.position.copyFrom(start);
	});
};
