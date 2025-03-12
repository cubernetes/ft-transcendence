import { createHomePage } from "../pages/HomePage";
import { createGamePage } from "../pages/GamePage";
import { createProfilePage } from "../pages/ProfilePage";
import { createLeaderboardPage } from "../pages/LeaderboardPage";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: () => Promise<HTMLElement> } = {
        home: createHomePage,
        game: createGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
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

        // Clear the container
        container.innerHTML = "";

        // Render the appropriate page
        const createPage = routes[route];
        const pageEl = await createPage();
        container.appendChild(pageEl);
    }

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
