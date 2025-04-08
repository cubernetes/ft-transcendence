import { checkAccess } from "../modules/auth/auth.utils";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createLocalGamePage } from "../ui/pages/LocalGamePage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createSetupPage } from "../ui/pages/SetupPage";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: PageRenderer } = {
        setup: createSetupPage,
        landing: createLandingPage,
        localgame: createLocalGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
    };

    const handleRouteChange = async () => {
        const route = window.location.hash.slice(1);

        // Redirect to default page upon invalid route
        if (!(route in routes)) {
            window.location.href = window.cfg.url.default;
            return;
        }

        // Functionally dispatch the event bubbling down to all children elements
        const dispatchEventDown = (parent: HTMLElement, evt: Event) => {
            // Dispatch the event to the parent first
            parent.dispatchEvent(evt);

            // Dispatch the event to all child elements
            parent.querySelectorAll("*").forEach((child) => {
                child.dispatchEvent(evt);
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

        // TODO: persist canvas maybe so renderer doesn't have to be recreated every single time?
        // const canvasEl = document.getElementById(window.cfg.id.canvas);
        container.innerHTML = "";
        container.appendChild(fragment);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
