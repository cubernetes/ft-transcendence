import { checkAccess } from "../auth/auth.utils";
import { createGamePage } from "../pages/game/game.gameplay";
import { createLeaderboardPage } from "../pages/menu/menu.leaderboard";
import { createProfilePage } from "../pages/menu/menu.profile";
import { createSetupPage } from "../pages/menu/menu.setup";
import { createSimulationPage } from "../pages/menu/menu.simulation";
import { createHomePage } from "../pages/pages.home";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: () => Promise<HTMLElement> } = {
        home: createHomePage,
        game: createGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        simulation: createSimulationPage,
        setup: createSetupPage,
    };

    async function handleRouteChange() {
        const route = window.location.hash.slice(1);

        // Redirect to home upon invalid route
        if (!(route in routes)) {
            window.location.href = "#home";
            return;
        }

        const currentPage = container.firstElementChild;
        if (currentPage) {
            currentPage.dispatchEvent(new Event("destroy"));
        }

        // Check access for protected routes
        checkAccess();

        // Render the appropriate page
        const createPage = routes[route];
        const pageEl = await createPage();
        container.innerHTML = "";
        container.appendChild(pageEl);
    }

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
