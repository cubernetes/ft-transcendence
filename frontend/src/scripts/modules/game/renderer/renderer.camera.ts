import {
    Animation,
    ArcRotateCamera,
    type Camera,
    type Engine,
    type Scene,
    Vector3,
} from "@babylonjs/core";

export const createCamera = (engine: Engine): ArcRotateCamera => {
    //TODO: check if Class TargetCamera makes more sense.
    const camera = new ArcRotateCamera(
        "pongCamera",
        -Math.PI / 2, // alpha - side view (fixed)
        Math.PI / 4,
        200, // radius - distance from center
        Vector3.Zero(), // target - looking at center
        engine.scene
    );

    // Disable keyboard controls
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    // camera.inputs.clear();
    camera.attachControl(engine.getRenderingCanvas(), true);

    return camera;
};
