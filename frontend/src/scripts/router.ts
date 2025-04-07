import { checkAccess } from "./auth/auth.utils";
// import { createProfilePage } from "./pages/menu/menu.profile";
// import { createSetupPage } from "./pages/menu/menu.setup";
// import { createTotpSetupPage } from "./pages/menu/pages.totpSetup";
import { createHomePage } from "./pages/home/home.page";
import { createLeaderboardPage } from "./pages/leaderboard/leaderboard.page";

// import { createTotpVerifyPage } from "./pages/pages.totpVerify";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: () => Promise<HTMLElement> } = {
        home: createHomePage,
        // game: createGamePage,
        // profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        // setup: createSetupPage,
        // totpSetup: createTotpSetupPage,
        // totpVerify: createTotpVerifyPage,
    };

    const handleRouteChange = async () => {
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
        if (route != "totpVerify") {
            // TODO: code smell
            checkAccess();
        }

        // Render the appropriate page
        const createPage = routes[route];
        const pageEl = await createPage();
        container.innerHTML = "";
        container.appendChild(pageEl);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
