import type config from "./global/config";
import type { logger } from "./utils/logger";
import type { StaticSound, StreamingSound } from "@babylonjs/core";
import type { earcut } from "earcut";

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
    interface AudioEngineV2 {
        bgMusic?: StreamingSound;
        hitSound?: StaticSound;
        bounceSound?: StaticSound;
        blopSound?: StaticSound;
    }
}
