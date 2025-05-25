import type { CONSTANTS } from "./global/constants";
import type { logger } from "./utils/logger";
import type { AudioEngineV2, Scene, StaticSound, StreamingSound } from "@babylonjs/core";
import type { EthereumProvider } from "@metamask/providers";

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
    }

    // Define some shared types globally for easy access
    type UIComponent = HTMLElement[];
    type UIContainer = HTMLElement;
    type PageRenderer = () => UIComponent | Promise<UIComponent>;
}

declare module "@babylonjs/core" {
    interface Engine {
        shadowsEnabled: boolean;
        bgmEnabled: boolean;
        sfxEnabled: boolean;
        audio: AudioEngineV2;
        scene?: Scene;
    }

    interface AudioEngineV2 {
        bgMusic: StreamingSound;
        hitSound: StaticSound;
        bounceSound: StaticSound;
        blopSound: StaticSound;
        ballSound: StaticSound;
    }
}
