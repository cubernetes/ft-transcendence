import {
    Color3,
    Engine,
    Mesh,
    MeshBuilder,
    PBRMaterial,
    Quaternion,
    Scene,
    StandardMaterial,
    Texture,
    TrailMesh,
    Vector3,
} from "@babylonjs/core";

const ballConfig = (scene: Scene, radius: number) => {
    //Note the textures for this method are not included in the code

    const material = new PBRMaterial("ballMat", scene);
    // pbr.environmentIntensity = 0.25;

    material.albedoColor = new Color3(1, 0.2, 0.6);
    material.albedoTexture = new Texture(
        `${window.cfg.dir.texture}/red_ground/cracked_red_ground_diff_1k.jpg`,
        scene
    );

    material.metallic = 0.2;
    material.roughness = 0.5;

    material.bumpTexture = new Texture(
        `${window.cfg.dir.texture}/red_ground/cracked_red_ground_nor_dx_1k.jpg`,
        scene
    );
    material.bumpTexture.level = 20;

    // Create trail material
    const trailMaterial = new StandardMaterial("trailMat", scene);
    trailMaterial.diffuseColor = new Color3(1, 0, 0);
    trailMaterial.alpha = 0.5;

    return {
        name: "ball",
        options: {
            diameter: radius * 2,
        },
        material,
        trailMaterial,
    };
};

export const createBall = (engine: Engine, scene: Scene, pos: Vector3, radius: number): Mesh => {
    const config = ballConfig(scene, radius);
    const { name, options, material, trailMaterial } = config;
    const ball = MeshBuilder.CreateSphere(name, options, scene);

    ball.position = pos;
    ball.rotationQuaternion = Quaternion.Identity();
    ball.material = material;
    engine.ballMat = material;

    engine.audio.hitSound.spatial.attach(ball);
    engine.audio.bounceSound.spatial.attach(ball);
    engine.audio.blopSound.spatial.attach(ball);
    engine.audio.ballSound.spatial.attach(ball);

    const trail = new TrailMesh("ballTrail", ball, scene, radius, 30);
    trail.material = trailMaterial;
    return ball;
};
