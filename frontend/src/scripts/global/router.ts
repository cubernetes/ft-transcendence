import { authStore } from "../modules/auth/auth.store";
import { gameStore } from "../modules/game/game.store";
import { hidePageElements, showPageElements, showRouter } from "../modules/layout/layout.service";
import { layoutStore } from "../modules/layout/layout.store";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createQuickPlayPage } from "../ui/pages/QuickPlayPage";
import { createSetupPage } from "../ui/pages/SetupPage";
import { createTournamentPage } from "../ui/pages/TournamentPage";
import { replaceChildren } from "../utils/dom-helper";

const ROUTES = {
    landing: createLandingPage,
    setup: createSetupPage,
    profile: createProfilePage,
    quickplay: createQuickPlayPage,
    leaderboard: createLeaderboardPage,
    tournament: createTournamentPage,
} satisfies Record<string, PageRenderer>;

export type Route = keyof typeof ROUTES;

// A type-safe list of protected routes, i.e. only available after logging in
// Temporarily protect all routes so always start in landing page
// TODO: Commented out localgame and aigame for quickplay.
const PROTECTED_ROUTES: Route[] = ["setup", "profile", "leaderboard"];

const renderRoute = async (dest: string) => {
    // Go to default page upon invalid route
    let route = (dest in ROUTES ? dest : CONST.ROUTE.DEFAULT) as Route;

    // Check auth state for protected routes
    if (PROTECTED_ROUTES.includes(route)) {
        const authState = authStore.get();
        // Go to default page if not logged in
        if (!authState.isAuthenticated) {
            route = CONST.ROUTE.DEFAULT;
        }
    }

    // Clean up game session when route changes, this probably belongs somewhere else
    gameStore.update({ isPlaying: false });

    // Create the appropriate page as an array of HTMLElement
    const createPage = ROUTES[route];
    const pageElements = await createPage();

    const { router } = layoutStore.get();
    replaceChildren(router, pageElements);

    // TODO: Clean up later
    if (route === "landing" || route === "quickplay") {
        hidePageElements();
    } else {
        showPageElements();
    }

    showRouter();
};

// Init to note whether it's the first time ever loading or not
export const navigateTo = (dest: string, init: boolean = false) => {
    const path = `/${dest}`;

    log.debug("navigating!");
    // Alread in the page, do nothing
    if (location.pathname === path && !init) return log.warn(`Already in ${dest}`);

    history.pushState({}, "", path);
    renderRoute(dest);
};

export const handlePopState = () => {
    // Remove slash
    const dest = location.pathname.slice(1);

    log.debug(`HandlePopState triggered, dest: ${dest}`);
    renderRoute(dest);
};
