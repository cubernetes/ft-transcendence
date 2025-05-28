import type { Route } from "./constants";
import { authStore } from "../modules/auth/auth.store";
import { gameStore } from "../modules/game/game.store";
import { hidePageElements, showPageElements, showRouter } from "../modules/layout/layout.service";
import { layoutStore } from "../modules/layout/layout.store";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createLobbyPage } from "../ui/pages/LobbyPage";
import { createLoginPage } from "../ui/pages/LoginPage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createSetupPage } from "../ui/pages/SetupPage";
import { createStatsPage } from "../ui/pages/StatsPage";
import { createTournamentPage } from "../ui/pages/TournamentPage";
import { dispatchEventDown, replaceChildren } from "../utils/dom-helper";

const { DEFAULT, LANDING, PLAY, QUICKPLAY, PROFILE, LEADERBOARD, TOURNAMENT, LOBBY, LOGIN, STATS } =
    CONST.ROUTE;

const ROUTES = {
    [LANDING]: createLandingPage,
    [PLAY]: createSetupPage,
    [QUICKPLAY]: createSetupPage,
    [PROFILE]: createProfilePage,
    [LEADERBOARD]: createLeaderboardPage,
    [TOURNAMENT]: createTournamentPage,
    [LOBBY]: createLobbyPage,
    [LOGIN]: createLoginPage,
    [STATS]: createStatsPage,
} satisfies Record<string, PageRenderer>;

// Protected routes, i.e. only available after logging in
const PROTECTED_ROUTES: Route[] = [PLAY, PROFILE, LEADERBOARD, TOURNAMENT, LOBBY, STATS];

// Routes that will have router container take up the whole screen, i.e. no header or footer
const FULL_WINDOW_ROUTES: Route[] = [LANDING, LOGIN, QUICKPLAY];

const renderRoute = async (dest: string) => {
    // Go to default page upon invalid route
    let route = (dest in ROUTES ? dest : DEFAULT) as Route;

    // Check auth state for protected routes and go to default page if not logged in
    if (PROTECTED_ROUTES.includes(route) && !authStore.get().isAuthenticated) {
        route = DEFAULT;
    }

    // Create the appropriate page as an array of HTMLElement
    const createPage = ROUTES[route];
    const pageElements = await createPage();

    const { router } = layoutStore.get();
    replaceChildren(router, pageElements);

    FULL_WINDOW_ROUTES.includes(route) ? hidePageElements() : showPageElements();
    showRouter();
};

const resetState = () => {
    // Ensure modal overlay is closed if one is open
    document.getElementById(CONST.ID.MODAL_OVERLAY)?.remove();

    // Ensure modal container is closed properly if one is open
    const modalCtn = document.getElementById(CONST.ID.MODAL_CTN);
    if (modalCtn) {
        dispatchEventDown(modalCtn, new Event("destory"));
        modalCtn.remove();
    }

    // Ensure game is purged if one is ongoing
    const { controller, isPlaying } = gameStore.get();
    if (isPlaying) controller?.endGame();
};

/** Navigate to route, default to do nothing if it's already in the route unless force is true */
export const navigateTo = (dest: Route, force: boolean = false) => {
    resetState();

    const path = `/${dest}`;

    // Alread in this route, do nothing unless it's the first route
    if (location.pathname === path && !force) return log.warn(`Already in ${dest}`);

    history.pushState({}, "", path);
    renderRoute(dest);
};

export const handlePopState = () => {
    resetState();

    // Remove slash
    const dest = location.pathname.slice(1);

    log.debug(`HandlePopState triggered, dest: ${dest}`);
    renderRoute(dest);
};
