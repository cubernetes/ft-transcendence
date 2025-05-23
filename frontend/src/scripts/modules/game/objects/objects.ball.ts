import {
    Animation,
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
import { PongConfig } from "@darrenkuro/pong-core";

const ballConfig = (scene: Scene, radius: number) => {
    const material = new PBRMaterial(CONST.NAME.MAT_BALL, scene);
    // pbr.environmentIntensity = 0.25;

    material.albedoColor = new Color3(1, 0.2, 0.6);
    material.albedoTexture = new Texture(
        `${CONST.DIR.TEXTURE}/red_ground/cracked_red_ground_diff_1k.jpg`,
        scene
    );

    material.metallic = 0.2;
    material.roughness = 0.5;

    material.bumpTexture = new Texture(
        `${CONST.DIR.TEXTURE}/red_ground/cracked_red_ground_nor_dx_1k.jpg`,
        scene
    );
    material.bumpTexture.level = 20;

    // Create trail material
    const trailMaterial = new StandardMaterial("trailMat", scene);
    trailMaterial.diffuseColor = new Color3(1, 0, 0);
    trailMaterial.alpha = 0.5;

    return {
        name: CONST.NAME.BALL,
        options: { diameter: radius * 2 },
        material,
        trailMaterial,
    };
};

export const createBall = (scene: Scene, config: PongConfig): Mesh => {
    const radius = config.ball.r;
    const { name, options, material, trailMaterial } = ballConfig(scene, radius);
    const ball = MeshBuilder.CreateSphere(name, options, scene);

    const { x, y, z } = config.ball.pos;
    ball.position = new Vector3(x, y, z);

    ball.rotationQuaternion = Quaternion.Identity();
    ball.material = material;

    //engine.ballMat = material;

    const trail = new TrailMesh("ballTrail", ball, scene, radius, 30);
    trail.material = trailMaterial;
    return ball;
};

export const pulseBall = (scene: Scene) => {
    const material = scene.getMaterialByName(CONST.NAME.MAT_BALL)! as PBRMaterial;
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
