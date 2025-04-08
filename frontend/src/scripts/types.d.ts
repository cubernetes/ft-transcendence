import type config from "./global/config";
import type { logger } from "./utils/logger";
import type {
    ArcRotateCamera,
    DirectionalLight,
    Mesh,
    PBRMaterial,
    Scene,
    ShadowGenerator,
    StaticSound,
    StreamingSound,
} from "@babylonjs/core";
import type { earcut } from "earcut";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

declare global {
    const process: {
        env: {
            WATCH: "1" | "0";
            NODE_ENV: "development" | "production";
        };
    };

    interface Window {
        ethereum?: any; // TODO: shouldn't use any if it can be helped?
        earcut: earcut; // TODO: Check if correct for earcut type
        cfg: typeof config;
        log: typeof logger;
    }

    // Globally defined types so no need to import
    type PageRenderer = () => Promise<HTMLElement[]>;
    type SoundConfig = {
        name: string;
        src: string;
        options: Record<string, unknown>;
    };
}

declare module "@babylonjs/core" {
    interface Engine {
        shadowsEnabled: boolean;
        soundsEnabled: boolean;
        shadowGenerator: ShadowGenerator;
        directionalLight: DirectionalLight;
        controls: AdvancedDynamicTexture;
        camera: ArcRotateCamera;
        scene: Scene;
        audio: AudioEngineV2;
        ball: Mesh;
        leftPaddle: Mesh;
        rightPaddle: Mesh;
        score: Mesh;
        ballMat: PBRMaterial;
    }

    interface AudioEngineV2 {
        bgMusic: StreamingSound;
        hitSound: StaticSound;
        bounceSound: StaticSound;
        blopSound: StaticSound;
        ballSound: StaticSound;
    }
}
