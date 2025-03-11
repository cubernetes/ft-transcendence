import { createHomePage } from "../pages/HomePage";
import { createGamePage } from "../pages/GamePage";
import { createProfilePage } from "../pages/ProfilePage";
import { createLeaderboardPage } from "../pages/LeaderboardPage";

export function createRouter(container: HTMLElement): void {
    const routes: { [key: string]: () => Promise<HTMLElement> } = {
        home: createHomePage,
        game: createGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
    };

    async function handleRouteChange() {
        // Get the route from the URL hash (without the #)
        const route = window.location.hash.slice(1);

        // Clear the container
        container.innerHTML = "";

        // Render the appropriate page
        const createPage = routes[route] || routes[""];
        const pageEl = await createPage();
        container.appendChild(pageEl);
    }

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
}
