import { authStore } from "../modules/auth/auth.store";
import { layoutStore } from "../modules/layout/layout.store";
import { createGamePage } from "../ui/pages/GamePage";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createSetupPage } from "../ui/pages/SetupPage";
import { createTotpSetupPage } from "../ui/pages/TotpSetupPage";

export const createRouter = (ctn: HTMLElement): void => {
    const routes = {
        landing: createLandingPage,
        setup: createSetupPage,
        onlinegame: createGamePage("online"),
        localgame: createGamePage("local"),
        aigame: createGamePage("ai"),
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        totp: createTotpSetupPage, // Refactor into modal
    } satisfies Record<string, PageRenderer>;

    // A type-safe list of protected routes, i.e. only available after logging in
    // Temporarily protect all routes so always start in landing page
    // Because that's where engine is initialized and without user interaction
    // An unmute button will pop up
    // And skipping landing page will skip background music
    // Might change logic later
    const protectedRoutes: (keyof typeof routes)[] = [
        "setup",
        "onlinegame",
        "profile",
        "leaderboard",
        "totp",
        "localgame",
        "aigame",
    ];

    const handleRouteChange = async () => {
        // Clean up game session when route changes, this probably belongs somewhere else
        // gameStore.update({ isPlaying: false, mode: null });

        const hash = window.location.hash.slice(1);

        // Redirect to default page upon invalid route
        if (!(hash in routes)) {
            window.location.href = window.cfg.url.default;
            return;
        }

        const route = hash as keyof typeof routes;

        // Check auth state for protected routes
        if (protectedRoutes.includes(route)) {
            const authState = authStore.get();
            // Redirect to default page if not logged in
            if (!authState.isAuthenticated) {
                window.location.href = window.cfg.url.default;
                return;
            }
        }

        const { router } = layoutStore.get();
        if (!router) {
            window.log.error("Router cannot find router container");
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

        dispatchEventDown(router, new Event("destroy"));

        // Render the appropriate page
        const createPage = routes[route];
        const pageElements = await createPage();

        const fragment = document.createDocumentFragment();
        pageElements.forEach((el) => fragment.appendChild(el));

        router.innerHTML = "";
        router.appendChild(fragment);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
