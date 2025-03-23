import { createHomePage } from "../pages/HomePage";
import { createGamePage } from "../pages/GamePage";
import { createProfilePage } from "../pages/ProfilePage";
import { createLeaderboardPage } from "../pages/LeaderboardPage";
import { createLoginPage } from "../pages/LoginPage";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: () => Promise<HTMLElement> } = {
        home: createHomePage,
        game: createGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        login: createLoginPage,
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
