import {
    Mesh,
    Engine,
    Scene,
    AudioEngineV2,
    StreamingSound,
    StaticSound,
    IFontData,
    ArcRotateCamera,
    ShadowGenerator,
    DirectionalLight,
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Control,
    StackPanel,
    Button,
    TextBlock,
    Slider,
    ImageBasedSlider,
    Image,
    Grid,
} from "@babylonjs/gui";
// Game state
export interface IBabylonGameState {
    score: { player1: number; player2: number };
    scoreText?: Mesh;
    ball?: Mesh;
    paddle1?: Mesh;
    paddle2?: Mesh;
    fontData: any;
    gameRunning: boolean;
    lastCollisionEvents: ICollisionEvent[];
}

export interface IServerGameState {
    ballPosition: { x: number; y: number; z: number };
    //TODO: playerID should be a number
    paddlePosition: { [playerId: string]: { x: number; y: number; z: number } };
    score?: { player1: number; player2: number };
    collisionEvents?: ICollisionEvent[];
}

export interface ICollisionEvent {
    type: "paddle" | "wall" | "score";
    timestamp: number;
}

export type SoundType = "background" | "bounce" | "hit";
export type Direction = "up" | "down" | "stop";

export interface GameElements {
    engine: Engine;
    scene: Scene;
    audioEngine: AudioEngineV2;
    bgMusic: StreamingSound;
    hitSound: StaticSound;
    bounceSound: StaticSound;
    blopSound: StaticSound;
    board: Mesh;
    paddle1: Mesh;
    paddle2: Mesh;
    ball: Mesh;
}

export interface BabylonObjects {
    engine: Engine;
    scene: Scene;
    light: DirectionalLight;
    shadowGenerator: ShadowGenerator;
    shadowsEnabled: boolean;
    controls: AdvancedDynamicTexture;
    audioEngine: AudioEngineV2;
    bgMusic: StreamingSound;
    hitSound: StaticSound;
    bounceSound: StaticSound;
    blopSound: StaticSound;
    camera: ArcRotateCamera;
    board: Mesh;
    ball: Mesh;
    paddle1: Mesh;
    paddle2: Mesh;
    fontData: IFontData;
    // public scoreText!: Mesh;
}
