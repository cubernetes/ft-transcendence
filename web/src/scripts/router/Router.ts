import { createHomePage } from "../pages/HomePage";
import { createGamePage } from "../pages/GamePage";
import { createProfilePage } from "../pages/ProfilePage";
import { createLeaderboardPage } from "../pages/LeaderboardPage";

export function createRouter(container: HTMLElement): void {
    const routes: { [key: string]: () => Promise<HTMLElement> | HTMLElement } = {
        "": createHomePage,
        home: createHomePage,
        game: createGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
    };

    async function handleRouteChange() {
        const currentPage = container.firstElementChild
        if (currentPage) {
            currentPage.dispatchEvent(new Event('destroy'))
        }

        // Clear the container
        container.innerHTML = "";

        // Render the appropriate page
        const route = window.location.hash.slice(1);
        const createPage = routes[route] || routes[""];
        const pageEl = await createPage();
        container.appendChild(pageEl);
    }

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
}
