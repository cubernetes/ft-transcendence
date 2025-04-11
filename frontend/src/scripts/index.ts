import earcut from "earcut";
import config from "./global/config";
import { logger } from "./utils/logger";

// Register globally accessible modules and utils
window.earcut = earcut; // Needed for babylonJS
window.cfg = config; // Constants
window.log = logger; // Register logger

// Register WebSocket for live reload
if (process.env.WATCH === "1") {
    const ws = new WebSocket("ws://localhost:35729");
    window.log.info("WebSocket for live reload connected");
    ws.onmessage = (msg) => {
        if (msg.data === "reload") {
            location.reload();
        }
    };
}

// Dynamic import to ensure globally registered objects are available

import("./modules/layout/layout.store").then(({ layoutStore }) => {
    const root = document.getElementById(window.cfg.id.app);
    if (!root) {
        window.log.error(`Fail to find HTMLElement #${window.cfg.id.app}`);
        return;
    }

    layoutStore.update({ root });

    // document.addEventListener("DOMContentLoaded", launchSite);
    // Maybe register cleanup logic, should close sockets?
    // document.addEventListener("beforeunload", );
    // re-open socket?
    // document.addEventListener("pageshow", );
});
