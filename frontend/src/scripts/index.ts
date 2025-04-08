import earcut from "earcut";
import config from "./global/config";
import { createRouter } from "./global/router";
import { logger } from "./utils/logger";

const launchSite = (): void => {
    const appElement = document.getElementById("app");
    if (appElement) {
        createRouter(appElement);
    }
};

// Register global states? Websocket? Auth? earcut?
window.cfg = config;
window.earcut = earcut; // Needed for babylonJS

document.addEventListener("DOMContentLoaded", launchSite);

/** Register WebSocket for live reload */
if (process.env.WATCH === "1") {
    const ws = new WebSocket("ws://localhost:35729");
    logger.info("WebSocket for live reload connected");
    ws.onmessage = (msg) => {
        if (msg.data === "reload") {
            location.reload();
        }
    };
}
