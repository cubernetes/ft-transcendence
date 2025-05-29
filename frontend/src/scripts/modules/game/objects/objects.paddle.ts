import type { Mesh, Scene, Vector3 } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { PongConfig, Size3D } from "@darrenkuro/pong-core";

const paddleConfig = (scene: Scene, size: Size3D) => {
    const material = new BABYLON.StandardMaterial("paddleMat", scene);
    material.diffuseColor = BABYLON.Color3.FromHexString("#e1b700");
    material.diffuseColor = new BABYLON.Color3(0, 0.5, 0);
    material.specularPower = 64;
    material.emissiveColor = new BABYLON.Color3(0, 0, 1);
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
        rotation: Math.PI / 2,
    };
};

const createPaddle = (name: string, scene: Scene, pos: Vector3, size: Size3D): Mesh => {
    const config = paddleConfig(scene, size);
    const { options, material, rotation } = config;

    // const paddle = BABYLON.MeshBuilder.CreateBox(name, options, scene);
    const paddle = BABYLON.MeshBuilder.CreateCylinder(
        name,
        {
            ...options,
            height: size.depth,
            diameter: size.height,
        },
        scene
    );

    paddle.position = pos;
    paddle.rotation.x = rotation;

    paddle.material = material;
    return paddle;
};

export const createPaddles = (scene: Scene, config: PongConfig) => {
    const leftPaddlePos = new BABYLON.Vector3(-config.board.size.width / 2 + 0.5, 0.5, 0);
    const leftPaddleSize = config.paddles[0].size;

    const rightPaddlePos = new BABYLON.Vector3(config.board.size.width / 2 - 0.5, 0.5, 0);
    const rightPaddleSize = config.paddles[1].size;

    createPaddle(CONST.NAME.LPADDLE, scene, leftPaddlePos, leftPaddleSize);
    createPaddle(CONST.NAME.RPADDLE, scene, rightPaddlePos, rightPaddleSize);
};
