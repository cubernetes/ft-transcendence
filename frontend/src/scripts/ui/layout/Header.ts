import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const createHeader = (header: HTMLElement): HTMLElement => {
    const anchor = createEl("a", "text-3xl font-bold", {
        text: "ft-transcendence",
        events: {
            click: (e) => {
                e.preventDefault(); // prevent full reload
                navigateTo(window.cfg.url.home);
            },
        },
    });

    const title = createEl("h1", "", { children: [anchor] });

    const navItems = {
        Home: window.cfg.url.home,
        Setup: window.cfg.url.home,
        Game: "localgame", // Temporary, gives an entry point to local game, for dev
        Online: "onlinegame", // Temporary, gives an entry point to online game, for dev
        Leaderboard: "leaderboard",
        Profile: "profile",
        TOTP: "totp", // TODO: Refactor
    };

    const navList = createEl("ul", "flex text-1xl space-x-4");

    for (const [title, route] of Object.entries(navItems)) {
        const link = createEl("a", "hover:underline", {
            text: title,
            events: {
                click: (e) => {
                    e.preventDefault(); // prevent full reload
                    navigateTo(route);
                },
            },
        });
        const li = createEl("li", "", { children: [link] });
        navList.appendChild(li);
    }

    const loginStatus = createEl("li");
    navList.appendChild(loginStatus);

    const unsubscribe = authStore.subscribe((state) => {
        window.log.debug("AuthStore triggered in header");
        if (state.isAuthenticated && state.username) {
            appendUserStatus(loginStatus, state.username);
        }
    });

    const nav = createEl("nav", "flex items-center space-x-6", { children: [navList] });

    appendChildren(header, [title, nav]);

    // Header is not being destoryed so should not trigger, but good practice to cleanup
    header.addEventListener("destory", () => {
        window.log.debug("Header unsubscribe to Login status");
        unsubscribe();
    });

    return header;
};
