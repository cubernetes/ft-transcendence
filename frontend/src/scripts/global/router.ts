import { authStore } from "../modules/auth/auth.store";
import { gameStore } from "../modules/game/game.store";
import { hidePageElements, showPageElements, showRouter } from "../modules/layout/layout.service";
import { layoutStore } from "../modules/layout/layout.store";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createLobbyPage } from "../ui/pages/LobbyPage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createSetupPage } from "../ui/pages/SetupPage";
import { createTournamentPage } from "../ui/pages/TournamentPage";
import { replaceChildren } from "../utils/dom-helper";

const ROUTES = {
    landing: createLandingPage,
    play: createSetupPage,
    quickplay: createSetupPage,
    profile: createProfilePage,
    leaderboard: createLeaderboardPage,
    tournament: createTournamentPage,
    lobby: createLobbyPage,
} satisfies Record<string, PageRenderer>;

export type Route = keyof typeof ROUTES;

// Protected routes, i.e. only available after logging in
const PROTECTED_ROUTES: Route[] = ["play", "profile", "leaderboard", "tournament", "lobby"];

// Routes that will have router container take up the whole screen, i.e. no header or footer
const FULL_WINDOW_ROUTES: Route[] = ["landing", "quickplay"];

const renderRoute = async (dest: string) => {
    // Go to default page upon invalid route
    let route = (dest in ROUTES ? dest : CONST.ROUTE.DEFAULT) as Route;

    // Check auth state for protected routes and go to default page if not logged in
    if (PROTECTED_ROUTES.includes(route) && !authStore.get().isAuthenticated) {
        route = CONST.ROUTE.DEFAULT;
    }

    // Clean up game session when route changes, this probably belongs somewhere else
    gameStore.update({ isPlaying: false });

    // Create the appropriate page as an array of HTMLElement
    const createPage = ROUTES[route];
    const pageElements = await createPage();

    const { router } = layoutStore.get();
    replaceChildren(router, pageElements);

    FULL_WINDOW_ROUTES.includes(route) ? hidePageElements() : showPageElements();
    showRouter();
};

/** Navigate to route, default to do nothing if it's already in the route unless force is true */
export const navigateTo = (dest: Route, force: boolean = false) => {
    const path = `/${dest}`;

    // Alread in this route, do nothing unless it's the first route
    if (location.pathname === path && !force) return log.warn(`Already in ${dest}`);

    history.pushState({}, "", path);
    renderRoute(dest);
};

export const handlePopState = () => {
    // Remove slash
    const dest = location.pathname.slice(1);

    log.debug(`HandlePopState triggered, dest: ${dest}`);
    renderRoute(dest);
};
