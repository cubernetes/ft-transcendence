import { authStore } from "../modules/auth/auth.store";
import { gameStore } from "../modules/game/game.store";
import { hidePageElements, showPageElements, showRouter } from "../modules/layout/layout.service";
import { layoutStore } from "../modules/layout/layout.store";
import { createGamePage } from "../ui/pages/GamePage";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createSetupPage } from "../ui/pages/SetupPage";
import { createTotpSetupPage } from "../ui/pages/TotpSetupPage";

export const createRouter = () => {
    const routes = {
        landing: createLandingPage,
        setup: createSetupPage,
        // Game routes are for dev, will be deleted later
        // Games will be directly strated through setup interaction
        onlinegame: createGamePage("online"),
        localgame: createGamePage("local"),
        aigame: createGamePage("ai"),
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        totp: createTotpSetupPage, // Refactor into modal later
    } satisfies Record<string, PageRenderer>;

    // A type-safe list of protected routes, i.e. only available after logging in
    // Temporarily protect all routes so always start in landing page
    const protectedRoutes: (keyof typeof routes)[] = [
        "setup",
        "onlinegame",
        "profile",
        "leaderboard",
        "totp",
        "localgame",
        "aigame",
    ];

    const handleRouteChange = async (dest?: string) => {
        const hash = window.location.hash.slice(1);
        const route = (dest ?? hash) as keyof typeof routes;

        // Clean up game session when route changes, this probably belongs somewhere else
        gameStore.update({ isPlaying: false });

        // Redirect to default page upon invalid route
        if (!(route in routes)) {
            window.log.debug("Unknown route, redirect...");
            window.location.href = window.cfg.url.default;
            return;
        }

        // Check auth state for protected routes
        if (protectedRoutes.includes(route)) {
            const authState = authStore.get();
            // Redirect to default page if not logged in
            if (!authState.isAuthenticated) {
                window.log.debug("User not authenticated, redirect to default page");
                window.location.href = window.cfg.url.default;
                return;
            }
        }

        const { router } = layoutStore.get();

        // Functionally dispatch the event bubbling down to all children elements
        const dispatchEventDown = (parent: HTMLElement, evt: Event) => {
            // Dispatch the event to the parent first
            parent.dispatchEvent(evt);

            // Dispatch the event to all child elements
            parent.querySelectorAll("*").forEach((child) => {
                child.dispatchEvent(evt);
            });
        };

        dispatchEventDown(router, new Event("destroy"));

        // Render the appropriate page
        const createPage = routes[route];

        const pageElements = await createPage();

        const fragment = document.createDocumentFragment();
        pageElements.forEach((el) => fragment.appendChild(el));

        router.innerHTML = "";
        router.appendChild(fragment);

        if (route === "landing" || route === "onlinegame" || route === "localgame") {
            hidePageElements();
        } else {
            showPageElements();
        }

        showRouter();
    };

    // Listen for hash changes
    window.addEventListener("hashchange", () => handleRouteChange());

    // Create router
    handleRouteChange("landing"); // Need without hash.. check how to improve to have it from cfg
};
