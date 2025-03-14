//The variables below are required by BabylonJS to render the scene.
//TODO: These variables should be set by the back-end not here. Maybe via an API call?
import { Vector3, Color3 } from "@babylonjs/core";

export let GAME_CONFIG = {
    objectConfigs: {
        PADDLE_WIDTH: 0.2,
        PADDLE_HEIGHT: 0.3,
        PADDLE_DEPTH: 5,
        BALL_RADIUS: 0.3,
        BOARD_WIDTH: 20,
        BOARD_HEIGHT: 0.1,
        BOARD_DEPTH: 15,
        PADDLE_SPEED: 0.3,
        BALL_SPEED: 0.2,
    },
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
