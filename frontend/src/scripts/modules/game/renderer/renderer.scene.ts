import {
    Axis,
    BackgroundMaterial,
    CubeTexture,
    Engine,
    GlowLayer,
    Mesh,
    MeshBuilder,
    Scene,
    Space,
    Texture,
} from "@babylonjs/core";

const setupScene = (scene: Scene) => {
    // ---------------- SKYBOX
    const sky = new BackgroundMaterial("skyMaterial", scene);
    sky.backFaceCulling = false;
    sky.reflectionTexture = new CubeTexture(`${window.cfg.dir.asset}/skybox/`, scene, [
        "px.png",
        "py.png",
        "pz.png",
        "nx.png",
        "ny.png",
        "nz.png",
    ]);
    // scene.environmentTexture = sky.reflectionTexture;
    sky.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    const skydome = MeshBuilder.CreateBox(
        "sky",
        {
            size: 1000,
            sideOrientation: Mesh.BACKSIDE,
        },
        scene
    );
    // skydome.infiniteDistance = true;
    skydome.material = sky;
    skydome.rotate(Axis.Y, Math.PI, Space.LOCAL);
};

export const createScene = (engine: Engine): Scene => {
    const scene = new Scene(engine);
    scene.audioEnabled = true; // This doesn't seem to be official, separate for audio engine?
    // scene.environmentIntensity = 0.5;
    const glow = new GlowLayer("glow", scene);
    glow.intensity = 5;

    setupScene(scene);

    return scene;
};
