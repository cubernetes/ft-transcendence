import { type Route, navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { I18nKey } from "../../modules/locale/locale.translation";
import { changeLanguage, getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const hydrateHeader = (headerEl: HTMLElement): HTMLElement => {
    // Title
    const titleEl = createEl("h1", "text-3xl font-bold cursor-pointer", {
        text: getText("title"),
        events: { click: () => navigateTo(CONST.ROUTE.HOME) },
        attributes: { [CONST.ATTR.I18N_TEXT]: "title" },
    });

    //
    const navList = createEl("ul", "flex text-1xl space-x-4");
    const navKeys: [I18nKey, Route][] = [
        ["home", CONST.ROUTE.HOME],
        ["setup", CONST.ROUTE.HOME],
        ["leaderboard", "leaderboard"],
        ["profile", "profile"],
    ];

    for (const [key, route] of navKeys) {
        const link = createEl("a", "hover:underline cursor-pointer", {
            text: getText(key),
            events: { click: () => navigateTo(route) },
            attributes: { [CONST.ATTR.I18N_TEXT]: key },
        });
        const li = createEl("li", "", { children: [link] });
        navList.appendChild(li);
    }

    // User login status
    const loginStatus = createEl("li");
    navList.appendChild(loginStatus);

    const unsubscribeAuth = authStore.subscribe((state) => {
        log.debug("AuthStore triggered in header");
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
        log.debug("Header unsubscribe to Login status");
        unsubscribeAuth();
    });

    return headerEl;
};
