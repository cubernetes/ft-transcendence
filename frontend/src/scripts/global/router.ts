import { authStore } from "../modules/auth/auth.store";
import { domStore } from "../modules/dom/dom.store";
import { createLandingPage } from "../ui/pages/LandingPage";
import { createLeaderboardPage } from "../ui/pages/LeaderboardPage";
import { createLocalGamePage } from "../ui/pages/LocalGamePage";
import { createProfilePage } from "../ui/pages/ProfilePage";
import { createRemoteGamePage } from "../ui/pages/RemoteGamePage";
import { createSetupPage } from "../ui/pages/SetupPage";
import { createTotpSetupPage } from "../ui/pages/TotpSetupPage";

export const createRouter = (ctn: HTMLElement): void => {
    const routes = {
        setup: createSetupPage,
        landing: createLandingPage,
        localgame: createLocalGamePage,
        remotegame: createRemoteGamePage,
        profile: createProfilePage,
        leaderboard: createLeaderboardPage,
        totp: createTotpSetupPage,
    } satisfies Record<string, PageRenderer>;

    // A type-safe list of protected routes, i.e. only available after logging in
    const protectedRoutes: (keyof typeof routes)[] = [
        "setup",
        "localgame",
        "remotegame",
        "profile",
    ];

    // A type-safe list of full screen routes, i.e. hide header and footer
    //const fullSreenRoutes: (keyof typeof routes)[] = ["landing"]; // Do that in createPage!

    const handleRouteChange = async () => {
        const hash = window.location.hash.slice(1);

        // Redirect to default page upon invalid route
        if (!(hash in routes)) {
            window.location.href = window.cfg.url.default;
            return;
        }

        const route = hash as keyof typeof routes;

        if (protectedRoutes.includes(route)) {
            const authState = authStore.get();
            if (!authState.isAuthenticated) {
                window.location.href = window.cfg.url.default;
                return;
            }
        }

        const { header, canvas, router, footer } = domStore.get();

        // if (fullSreenRoutes.includes(route)) {
        //     header?.classList.add("hidden");
        //     footer?.classList.add("hidden");
        // } else {
        //     header?.classList.remove("hidden");
        //     header?.classList.remove("hidden");
        // }

        // Functionally dispatch the event bubbling down to all children elements
        const dispatchEventDown = (parent: HTMLElement, evt: Event) => {
            // Dispatch the event to the parent first
            parent.dispatchEvent(evt);

            // Dispatch the event to all child elements
            parent.querySelectorAll("*").forEach((child) => {
                child.dispatchEvent(evt);
            });
        };

        dispatchEventDown(router!, new Event("destroy"));

        // Render the appropriate page
        const createPage = routes[route];
        const pageElements = await createPage();

        const fragment = document.createDocumentFragment();
        pageElements.forEach((el) => fragment.appendChild(el));

        // TODO: persist canvas maybe so renderer doesn't have to be recreated every single time?
        // const canvasEl = document.getElementById(window.cfg.id.canvas);
        router!.innerHTML = "";
        router!.appendChild(fragment);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);

    // Initial route
    handleRouteChange();
};
