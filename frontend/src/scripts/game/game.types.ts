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
import { AdvancedDynamicTexture } from "@babylonjs/gui";

export type Direction = "up" | "down" | "stop";

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
    ballSound: StaticSound;
    soundsEnabled: boolean;
    camera: ArcRotateCamera;
    board: Mesh;
    fontData: IFontData;
    score: Mesh | null;
    ball: Mesh;
    paddle1: Mesh;
    paddle2: Mesh;
}
