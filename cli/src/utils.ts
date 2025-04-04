// // Utility to convert "x: ..., y: ..., z: ..." → Vec2D using x and z
// function parseVec3ToVec2D(vecString: string): { x: number, y: number } {
//     const matches = vecString.match(/x:\s*(-?\d+(\.\d+)?),\s*y:\s*(-?\d+(\.\d+)?),\s*z:\s*(-?\d+(\.\d+)?)/);
//     if (!matches) throw new Error(`Invalid vec3 format: ${vecString}`);
//     const x = parseFloat(matches[1]);
//     const z = parseFloat(matches[5]);
//     return { x, y: z }; // z becomes y in CLI (2D vertical axis)
// }
import { Vec2D } from "./game.types";

export function vec3ToVec2D(vec3: { x: number; y: number; z: number }): Vec2D {
    return {
        x: vec3.x,
        y: vec3.z,
    }; // CLI uses x, z → x, y
}
