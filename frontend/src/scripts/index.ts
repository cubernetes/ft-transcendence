import { createRouter } from "./router";
import { logger } from "./utils/logger";

const launchSite = (): void => {
    const appElement = document.getElementById("app");
    if (appElement) {
        createRouter(appElement);
    }
};

document.addEventListener("DOMContentLoaded", launchSite);

/** Register WebSocket for live reload */
declare const process: { env: { WATCH: string } };
if (process.env.WATCH === "1") {
    const ws = new WebSocket("ws://localhost:35729");
    logger.info("WebSocket for live reload connected");
    ws.onmessage = (msg) => {
        if (msg.data === "reload") {
            location.reload();
        }
    };
}
