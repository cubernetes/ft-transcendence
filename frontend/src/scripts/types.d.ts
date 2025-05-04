import type { CONSTANTS } from "./global/constants";
import type { FtButton } from "./ui/components/Button";
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
            LIVE_RELOAD_PORT: string;
        };
    };

    // Window is the same as global, TODO: check earcut, if it's needed, and ethereum
    const CONST: typeof CONSTANTS;
    const log: typeof logger;

    interface Window {
        ethereum?: any; // TODO: shouldn't use any if it can be helped?
        earcut: earcut; // TODO: Check if correct for earcut type
        CONST: typeof CONSTANTS;
        log: typeof logger;
    }

    // Globally defined types so no need to import
    // Probably not good practice esp as things grow...
    type UIComponent = HTMLElement[];
    type UIContainer = HTMLElement;
    type PageRenderer = () => UIComponent | Promise<UIComponent>;
}

declare module "@babylonjs/core" {
    interface Engine {
        shadowsEnabled: boolean;
        soundsEnabled: boolean;
        audio: AudioEngineV2;
        shadowGenerator: ShadowGenerator;
        directionalLight: DirectionalLight;
        controls: AdvancedDynamicTexture;
        camera: ArcRotateCamera;
        scene: Scene;
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
