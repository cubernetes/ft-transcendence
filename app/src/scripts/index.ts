import { createRouter } from "./router/Router";

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
    console.log("WebSocket for live reload connected");
    ws.onmessage = (msg) => {
        if (msg.data === "reload") {
            location.reload();
        }
    };
}
