import { createHomePage } from "../pages/pages.home";
import { createGamePage } from "../pages/pages.game";
import { createProfilePage } from "../pages/pages.profile";
import { createLeaderboardPage } from "../pages/pages.leaderboard";
import { createLoginPage } from "../pages/pages.login";
import { createSimulationPage } from "../pages/pages.simulation";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: () => Promise<HTMLElement> } = {
        home: createHomePage,
        game: createGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        login: createLoginPage,
        simulation: createSimulationPage,
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
