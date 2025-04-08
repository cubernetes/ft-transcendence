//TODO: These variables should be set by the back-end not here. Maybe via an API call?
import { Color3, Vector3 } from "@babylonjs/core";
import { GAME_CONFIG_URL } from "../../config";

export const getObjectConfigs = () => fetch(GAME_CONFIG_URL);

export const gameConfig = {
    positions: {
        SCORE: new Vector3(0, 0, 8),
        //TODO: The 20 is hardcoded. This should be calculated based on the board width
        PADDLE1: new Vector3(-20 / 2 + 0.5, 0.5, 0),
        PADDLE2: new Vector3(20 / 2 - 0.5, 0.5, 0),
        BOARD: new Vector3(0, -0.5, 0),
        BALL: new Vector3(0, 0, 0),
    },
    rotations: {
        SCORE: Math.PI / 2,
        PADDLE1: Math.PI,
        PADDLE2: Math.PI,
    },
    materials: {
        BOARD: { diffuseColor: new Color3(0, 1, 0), specularColor: new Color3(1, 0, 0) },
        PADDLE1: { diffuseColor: new Color3(0, 0, 1) },
        PADDLE2: { diffuseColor: new Color3(0, 0, 1) },
        BALL: { diffuseColor: new Color3(1, 0, 0) },
    },
};
