import { Color3, Mesh, MeshBuilder, Scene, Size, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Size3D } from "@darrenkuro/pong-core";

const paddleConfig = (scene: Scene, size: Size3D) => {
    const material = new StandardMaterial("paddleMat", scene);
    material.diffuseColor = Color3.FromHexString("#e1b700");
    material.specularPower = 64;
    // material.emissiveColor = new Color3(0, 0, 1);
    material.backFaceCulling = false;

    // const paddleMaterial3 = new StandardMaterial("paddleMat3", babylon.scene);
    // paddleMaterial3.diffuseColor = new Color3(0.2, 0.7, 1);
    // paddleMaterial3.specularPower = 64;
    // paddleMaterial3.emissiveColor = new Color3(0.1, 0.3, 1);
    // paddleMaterial3.backFaceCulling = false;
    // paddleMaterial3.alphaMode = 1;

    const { width, height, depth } = size;
    return {
        options: { width, height, depth },
        //options: { diameterX: size.width, diameterY: size.height, diameterZ: size.depth },
        material,
        //rotation: Math.PI,
    };
};

export const createPaddle = (name: string, scene: Scene, pos: Vector3, size: Size3D): Mesh => {
    const config = paddleConfig(scene, size);
    const { options, material } = config;

    const paddle = MeshBuilder.CreateBox(name, options, scene);

    paddle.position = pos;
    //paddle.rotation.x = rotation;
    paddle.material = material;
    return paddle;
};
