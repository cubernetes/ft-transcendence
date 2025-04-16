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

const renderRoute = async (dest: string) => {
    // Go to default page upon invalid route
    let route = (dest in routes ? dest : window.cfg.url.default) as keyof typeof routes;

    // Check auth state for protected routes
    if (protectedRoutes.includes(route)) {
        const authState = authStore.get();
        // Go to default page if not logged in
        if (!authState.isAuthenticated) {
            route = window.cfg.url.default as keyof typeof routes;
        }
    }

    // Clean up game session when route changes, this probably belongs somewhere else
    gameStore.update({ isPlaying: false });

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

    // TODO: Clean up later
    if (route === "landing" || route === "onlinegame" || route === "localgame") {
        hidePageElements();
    } else {
        showPageElements();
    }

    showRouter();
};

export const navigateTo = (dest: string) => {
    const path = `/${dest}`;

    if (window.location.pathname === path) {
        return; // Already in this page
    }

    history.pushState({}, "", path);
    renderRoute(dest);
};

export const handlePopState = () => {
    // Remove slash
    const dest = window.location.pathname.slice(1);

    renderRoute(dest);
};
