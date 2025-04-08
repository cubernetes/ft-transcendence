import { checkAccess } from "../modules/auth/auth.utils";
import { createLocalGamePage } from "../ui/pages/game/game.page.local";
// import { createTotpSetupPage } from "./pages/menu/pages.totpSetup";
import { createLandingPage } from "../ui/pages/landing/landing.page";
import { createLeaderboardPage } from "../ui/pages/leaderboard/leaderboard.page";
// import { createProfilePage } from "./pages/menu/menu.profile";
import { createSetupPage } from "../ui/pages/setup/setup.page";
import { logger } from "../utils/logger";

// import { createTotpVerifyPage } from "./pages/pages.totpVerify";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: () => Promise<HTMLElement[]> } = {
        setup: createSetupPage,
        landing: createLandingPage,
        localgame: createLocalGamePage,
        //profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        // totpSetup: createTotpSetupPage,
        // totpVerify: createTotpVerifyPage,
    };

    const handleRouteChange = async () => {
        const route = window.location.hash.slice(1);

        // Redirect to home upon invalid route
        // Should probably make a 404
        if (!(route in routes)) {
            window.location.href = "#landing";
            return;
        }

        // Functionally dispatch the event bubbling down to all children elements
        const dispatchEventDown = (parent: HTMLElement, event: Event) => {
            // Dispatch the event to the parent first
            parent.dispatchEvent(event);

            // Dispatch the event to all child elements
            parent.querySelectorAll("*").forEach((child) => {
                child.dispatchEvent(event);
            });
        };

        dispatchEventDown(container, new Event("destroy"));

        // Check access for protected routes
        if (route != "totpVerify") {
            // TODO: code smell
            checkAccess();
        }

        // Render the appropriate page
        const createPage = routes[route];
        const pageElements = await createPage();

        const fragment = document.createDocumentFragment();
        pageElements.forEach((el) => fragment.appendChild(el));

        container.innerHTML = "";
        container.appendChild(fragment);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
