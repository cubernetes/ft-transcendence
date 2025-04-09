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
import("./global/router").then(({ createRouter }) => {
    const launchSite = (): void => {
        const appElement = document.getElementById("app");
        if (appElement) {
            createRouter(appElement);
        } else {
            window.log.error("Fail to create router, couldn't find HTMLElement #app");
        }
    };
    document.addEventListener("DOMContentLoaded", launchSite);
});
