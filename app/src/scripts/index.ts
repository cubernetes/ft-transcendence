import { createRouter } from "./router/Router";

const launchSite = (): void => {
    const appElement = document.getElementById("app");
    if (appElement) {
        createRouter(appElement);
    }
};

document.addEventListener("DOMContentLoaded", launchSite);
