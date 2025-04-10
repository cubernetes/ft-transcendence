import { authStore } from "../modules/auth/auth.store";
import { layoutStore } from "../modules/layout/layout.store";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createLocalGamePage } from "../ui/pages/LocalGamePage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createRemoteGamePage } from "../ui/pages/RemoteGamePage";
import { createSetupPage } from "../ui/pages/SetupPage";
import { createTotpSetupPage } from "../ui/pages/TotpSetupPage";

export const createRouter = (ctn: HTMLElement): void => {
    const routes = {
        setup: createSetupPage,
        landing: createLandingPage,
        localgame: createLocalGamePage,
        remotegame: createRemoteGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        totp: createTotpSetupPage,
    } satisfies Record<string, PageRenderer>;

    // A type-safe list of protected routes, i.e. only available after logging in
    const protectedRoutes: (keyof typeof routes)[] = [
        "setup",
        "localgame",
        "remotegame",
        "profile",
    ];

    const handleRouteChange = async () => {
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
