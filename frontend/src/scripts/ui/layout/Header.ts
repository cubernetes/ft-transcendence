import { logout } from "../../modules/auth/auth.service";
import { authStore } from "../../modules/auth/auth.store";
import { createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const createHeader = async (): Promise<HTMLElement> => {
    const anchor = createEl("a", "text-3xl font-bold", {
        text: "ft-transcendence",
        attributes: { href: window.cfg.url.home },
    });
    const title = createEl("h1", "", { children: [anchor] });

    const navItems = {
        Home: window.cfg.url.home,
        Game: "#setup",
        Leaderboard: "#leaderboard",
        Profile: "#profile",
        TOTP: "#totp",
    };

    const navList = createEl("ul", "flex text-1xl space-x-4");

    for (const [title, hashId] of Object.entries(navItems)) {
        const link = createEl("a", "hover:underline", {
            text: title,
            attributes: { href: hashId },
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

    const header = createEl(
        "header",
        "bg-black/50 p-4 text-white justify-between items-center font-medieval hidden",
        { children: [title, nav] }
    );

    // Header is not being destoryed so should not trigger, but good practice to cleanup
    header.addEventListener("destory", () => {
        window.log.debug("Header unsubscribe to Login status");
        unsubscribe();
    });

    return header;
};
