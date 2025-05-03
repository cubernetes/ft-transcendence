import { type Route, navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { I18nKey } from "../../modules/locale/locale.en";
import { changeLanguage, getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const hydrateHeader = (headerEl: HTMLElement): HTMLElement => {
    // Title
    const titleEl = createEl("h1", "text-3xl font-bold cursor-pointer", {
        text: getText("title"),
        events: { click: () => navigateTo(window.cfg.url.home) },
        attributes: { [window.cfg.label.textKey]: "title" },
    });

    //
    const navList = createEl("ul", "flex text-1xl space-x-4");
    const navKeys: [I18nKey, Route][] = [
        ["home", window.cfg.url.home],
        ["setup", window.cfg.url.home],
        ["leaderboard", "leaderboard"],
        ["profile", "profile"],
        ["TOTP", "totp"],
    ];

    for (const [key, route] of navKeys) {
        const link = createEl("a", "hover:underline cursor-pointer", {
            text: getText(key),
            events: { click: () => navigateTo(route) },
            attributes: { [window.cfg.label.textKey]: key },
        });
        const li = createEl("li", "", { children: [link] });
        navList.appendChild(li);
    }

    // User login status
    const loginStatus = createEl("li");
    navList.appendChild(loginStatus);

    const unsubscribeAuth = authStore.subscribe((state) => {
        window.log.debug("AuthStore triggered in header");
        if (state.isAuthenticated && state.username) {
            appendUserStatus(loginStatus, state.username);
        }
    });

    // Language toggle
    const languageBtn = createEl("button", "hover:underline", {
        text: getText("lang"),
        events: { click: changeLanguage },
    });

    const navEl = createEl("nav", "flex items-center space-x-6", {
        children: [navList, languageBtn],
    });

    appendChildren(headerEl, [titleEl, navEl]);

    // Header is never destoryed but included for good practice
    headerEl.addEventListener("destory", () => {
        window.log.debug("Header unsubscribe to Login status");
        unsubscribeAuth();
    });

    return headerEl;
};
