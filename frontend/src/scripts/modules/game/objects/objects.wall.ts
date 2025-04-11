import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Size3D } from "@darrenkuro/pong-core";

const wallConfig = (scene: Scene, size: Size3D) => {
    const material = new StandardMaterial("cushion", scene);
    material.diffuseColor = new Color3(0.6, 0, 0); // Red color for visibility

    const positions = [
        new Vector3(0, -0.1, size.depth / 2 + 0.5), // Top
        new Vector3(0, -0.1, -size.depth / 2 - 0.5), // Bottom
        new Vector3(size.width / 2 + 0.5, -0.1, 0), // Right
        new Vector3(-size.width / 2 - 0.5, -0.1, 0), // Left
    ];

    return {
        name: "cushion",
        positions,
        material,
    };
};

export const createWalls = (scene: Scene, size: Size3D) => {
    const config = wallConfig(scene, size);
    const { name, positions, material } = config;

    const cushions: Mesh[] = [];
    positions.forEach((pos) => {
        const cushion = MeshBuilder.CreateBox(
            name,
            {
                width: pos.z === 0 ? 1 : size.width + 2,
                height: 0.5,
                depth: pos.z === 0 ? size.depth + 2 : 1,
            },
            scene
        );
        cushion.position = pos;
        cushion.material = material;
        cushions.push(cushion);
    });
};
