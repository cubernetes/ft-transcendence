import {
    Color3,
    GroundMesh,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { Size3D, defaultGameConfig } from "@darrenkuro/pong-core";

const boardConfig = (scene: Scene, size: Size3D) => {
    const material = new StandardMaterial("board", scene);

    // Add diffuse texture to material
    material.diffuseTexture = new Texture(
        `${window.cfg.dir.tile}/rubber_tiles_nor_gl_1k.jpg`,
        scene
    );
    material.diffuseColor = new Color3(0.8, 1, 0.8);
    (material.diffuseTexture as Texture).uScale = 4;
    (material.diffuseTexture as Texture).vScale = 3;

    // Add specular texture to material
    material.specularTexture = new Texture(
        `${window.cfg.dir.tile}/rubber_tiles_diff_1k.jpg`,
        scene
    );
    material.specularColor = new Color3(0.5, 0.2, 0);

    // Add bump texture to material
    material.bumpTexture = new Texture(`${window.cfg.dir.tile}/rubber_tiles_rough_1k.jpg`, scene);
    material.roughness = 50;

    return {
        name: "board",
        src: `${window.cfg.dir.asset}/height_map1.jpeg`,
        options: {
            width: size.width,
            height: size.depth,
            subdivisions: 4,
        },
        material,
        pos: new Vector3(0, -0.5, 0),
    };
};

const createMiddleline = (scene: Scene): Mesh => {
    const middleLine = MeshBuilder.CreateBox(
        "middleLine",
        {
            width: 0.1,
            height: defaultGameConfig.board.size.depth,
            depth: 0.1,
        },
        scene
    );
    middleLine.rotation.x = Math.PI / 2;
    middleLine.position = new Vector3(0, -0.5, 0);

    const middleLineMaterial = new StandardMaterial("middleLine", scene);
    middleLineMaterial.diffuseColor = new Color3(1, 1, 1);
    middleLineMaterial.specularColor = new Color3(1, 0, 0);
    middleLine.material = middleLineMaterial;
    middleLine.receiveShadows = true;

    return middleLine;
};

const createBoard = (scene: Scene, pos: Vector3, size: Size3D) => {
    const config = boardConfig(scene, size);

    const { name, options } = config;
    const board = MeshBuilder.CreateGround(name, options, scene);

    // board.position.y = -0.5; // reset later??
    board.material = config.material;
    board.position = pos;
    board.receiveShadows = true;

    return board;
};
