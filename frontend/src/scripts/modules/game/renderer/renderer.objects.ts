import {
    Color3,
    CreateGroundFromHeightMap,
    type Scene,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";
import { type Size3D, defaultGameConfig } from "@darrenkuro/pong-core";

// #region: Object Configs
const boardConfig = (scene: Scene, size: Size3D) => {
    const material = new StandardMaterial("board", scene);
    material.backFaceCulling = true; // Turn off back face culling to render both sides of the mesh
    material.diffuseColor = new Color3(0, 1, 0);
    material.specularColor = new Color3(1, 0, 0);

    return {
        name: "board",
        src: `${window.cfg.dir.asset}/height_map1.jpeg`,
        options: {
            width: size.width,
            height: size.depth,
            subdivisions: 50,
            maxHeight: 0.3,
            minHeight: -0.2,
        },
        material,
        pos: new Vector3(0, -0.5, 0),
    };
};

const createBoard = (scene: Scene, pos: Vector3, size: Size3D) => {
    const config = boardConfig(scene, size);

    const { name, src, options } = config;
    const board = CreateGroundFromHeightMap(name, src, options, scene);

    board.material = config.material;
    board.position = pos;
    // board.material.wireframe = true;
    board.receiveShadows = true;

    return board;
};

const createPaddle = () => {};

export const createObjects = (scene: Scene) => {
    createBoard(scene, new Vector3(0, -0.5, 0), defaultGameConfig.board.size);
};
