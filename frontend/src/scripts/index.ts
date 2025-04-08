import earcut from "earcut";
import config from "./global/config";
import { createRouter } from "./global/router";
import { logger } from "./utils/logger";

/** Register globally accessible modules and utils */
window.cfg = config;
window.log = logger;
window.earcut = earcut; // Needed for babylonJS

/** Register WebSocket for live reload */
if (process.env.WATCH === "1") {
    const ws = new WebSocket("ws://localhost:35729");
    window.log.info("WebSocket for live reload connected");
    ws.onmessage = (msg) => {
        if (msg.data === "reload") {
            location.reload();
        }
    };
}

const launchSite = (): void => {
    const appElement = document.getElementById("app");
    if (appElement) {
        createRouter(appElement);
    } else {
        window.log.error("Fail to create router, couldn't find id #app");
    }
};

document.addEventListener("DOMContentLoaded", launchSite);
