import earcut from "earcut";
import { CONSTANTS } from "./global/constants";
import { logger } from "./utils/logger";

// Register global modules and utils; earcut needed for some polygon functions of babylonjs
Object.assign(globalThis, { earcut, log: logger, CONST: CONSTANTS });

// Register WebSocket for live reload for development
if (process.env.WATCH === "1") {
    const port = process.env.LIVE_RELOAD_PORT ?? 35729;
    const ws = new WebSocket(`ws://localhost:${port}`);
    log.info(`WebSocket for live reload connected at port ${port}`);
    ws.onmessage = (msg) => {
        if (msg.data === "reload") {
            location.reload();
        }
    };
}

// Dynamic import to ensure global modules are registered
import("./modules/layout/layout.store").then(({ layoutStore }) => {
    // Try to get root element by ID defined in constants
    const root = document.getElementById(CONST.ID.ROOT);
    if (!root) return log.error(`Fail to find HTMLElement #${CONST.ID.ROOT}`);

    // Entry point of the entire app at layoutStore so only need one dynamic import
    layoutStore.update({ root });
});
