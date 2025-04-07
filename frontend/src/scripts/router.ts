import { checkAccess } from "./auth/auth.utils";
// import { createTotpSetupPage } from "./pages/menu/pages.totpSetup";
import { createLandingPage } from "./pages/landing/landing.page";
import { createLeaderboardPage } from "./pages/leaderboard/leaderboard.page";
// import { createProfilePage } from "./pages/menu/menu.profile";
import { createSetupPage } from "./pages/setup/setup.page";

// import { createTotpVerifyPage } from "./pages/pages.totpVerify";

export const createRouter = (container: HTMLElement): void => {
    const routes: { [key: string]: () => Promise<HTMLElement[]> } = {
        setup: createSetupPage,
        landing: createLandingPage,
        //profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        // totpSetup: createTotpSetupPage,
        // totpVerify: createTotpVerifyPage,
    };

    const handleRouteChange = async () => {
        const route = window.location.hash.slice(1);

        // Redirect to home upon invalid route
        // Should probably make a 404
        if (!(route in routes)) {
            window.location.href = "#landing";
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
        const pageElements = await createPage();

        const fragment = document.createDocumentFragment();
        pageElements.forEach((el) => fragment.appendChild(el));

        container.innerHTML = "";
        container.appendChild(fragment);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
