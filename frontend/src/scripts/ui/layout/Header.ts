import { TranslationKey, changeLanguage, getText, languageStore } from "../../global/language";
import { type Route, navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const hydrateHeader = (headerEl: HTMLElement): HTMLElement => {
    // Title
    const titleEl = createEl("h1", "text-3xl font-bold cursor-pointer", {
        text: getText("title"),
        events: { click: () => navigateTo(window.cfg.url.home) },
    });

    //
    const navList = createEl("ul", "flex text-1xl space-x-4");
    const navKeys: [TranslationKey, Route][] = [
        ["home", window.cfg.url.home],
        ["setup", window.cfg.url.home],
        ["leaderboard", "leaderboard"],
        ["profile", "profile"],
        ["TOTP", "totp"],
    ];

    for (const [key, route] of navKeys) {
        const link = createEl("a", "hover:underline cursor-pointer", {
            text: getText(key),
            events: { click: (e) => navigateTo(route) },
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

    const unsubscribeLanguage = languageStore.subscribe(() => {
        titleEl.textContent = getText("title");
        languageBtn.textContent = getText("lang");
        Array.from(navList.querySelectorAll<HTMLAnchorElement>("a")).forEach((a, i) => {
            a.textContent = getText(navKeys[i][0]);
        });
    });

    // Header is never destoryed but included for good practice
    headerEl.addEventListener("destory", () => {
        window.log.debug("Header unsubscribe to Login status");
        unsubscribeAuth();
        unsubscribeLanguage();
    });

    return headerEl;
};
