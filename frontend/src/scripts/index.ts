import earcut from "earcut";
import { createRouter } from "./router";
import { logger } from "./utils/logger";

// Register global states? Websocket? Auth? earcut?
const launchSite = (): void => {
    const appElement = document.getElementById("app");
    if (appElement) {
        createRouter(appElement);
    }
};

window.earcut = earcut; // Need for babylonJS
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
