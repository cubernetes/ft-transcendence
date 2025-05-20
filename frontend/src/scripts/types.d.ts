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
import type { EthereumProvider } from "@metamask/providers";
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

    const CONST: typeof CONSTANTS;
    const log: typeof logger;

    interface Window {
        ethereum?: EthereumProvider;
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
        shadowsEnabled: boolean; // TODO: compare to the one in light
        bgmEnabled: boolean;
        sfxEnabled: boolean;
        audio: AudioEngineV2;
        scene?: Scene;

        // shadowGenerator: ShadowGenerator;
        // directionalLight: DirectionalLight;
        // controls: AdvancedDynamicTexture;
        // camera: ArcRotateCamera;
        // shadowObjs: Mesh[];
        // ball: Mesh;
        // leftPaddle: Mesh;
        // rightPaddle: Mesh;
        // score: Mesh;
        // ballMat: PBRMaterial;
    }

    interface AudioEngineV2 {
        bgMusic: StreamingSound;
        hitSound: StaticSound;
        bounceSound: StaticSound;
        blopSound: StaticSound;
        ballSound: StaticSound;
    }
}
