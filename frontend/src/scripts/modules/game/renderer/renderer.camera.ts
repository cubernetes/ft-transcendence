import {
    Animation,
    ArcRotateCamera,
    type Camera,
    type Engine,
    type Scene,
    Vector3,
} from "@babylonjs/core";

export const createCamera = (engine: Engine, scene: Scene): ArcRotateCamera => {
    //TODO: check if Class TargetCamera makes more sense.
    const camera = new ArcRotateCamera(
        "pongCamera",
        -Math.PI / 2, // alpha - side view (fixed)
        Math.PI / 4,
        200, // radius - distance from center
        Vector3.Zero(), // target - looking at center
        scene
    );

    // Disable keyboard controls
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    // camera.inputs.clear();
    camera.attachControl(engine.getRenderingCanvas(), true);

    // ----- CAMERA SLIDE-IN ANIMATION -----
    // ------------ RADIUS
    var radAnim = new Animation("animCam", "radius", 15, Animation.ANIMATIONTYPE_FLOAT);
    var keysPosition = [];
    keysPosition.push({
        frame: 0,
        value: 200,
    });
    keysPosition.push({
        frame: 80,
        value: 40,
    });
    keysPosition.push({
        frame: 100,
        value: 25,
    });
    radAnim.setKeys(keysPosition);
    camera.animations.push(radAnim);

    // ------------ ALPHA
    var alphaAnim = new Animation("animCam", "alpha", 15, Animation.ANIMATIONTYPE_FLOAT);
    var keysPosition = [];
    keysPosition.push({
        frame: 0,
        value: -Math.PI,
    });
    keysPosition.push({
        frame: 50,
        value: 0,
    });
    keysPosition.push({
        frame: 100,
        value: -Math.PI / 2,
    });
    alphaAnim.setKeys(keysPosition);
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

    scene.beginAnimation(camera, 0, 100, false, 1.0, setCameraLimits);

    return camera;
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
