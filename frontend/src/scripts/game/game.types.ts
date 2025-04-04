import {
    ArcRotateCamera,
    AudioEngineV2,
    DirectionalLight,
    Engine,
    IFontData,
    Mesh,
    Scene,
    ShadowGenerator,
    StaticSound,
    StreamingSound,
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Grid,
    Image,
    ImageBasedSlider,
    Slider,
    StackPanel,
    TextBlock,
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
    soundsEnabled: boolean;
    camera: ArcRotateCamera;
    board: Mesh;
    fontData: IFontData;
    score: Mesh | null;
    ball: Mesh;
    paddle1: Mesh;
    paddle2: Mesh;
}
