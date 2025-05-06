import { type Route, navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { I18nKey } from "../../modules/locale/locale.translation";
import { changeLanguage, getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createHeading } from "../components/Heading";
import { appendUserStatus } from "./UserStatus";

export const hydrateHeader = (headerEl: HTMLElement): HTMLElement => {
    // Title
    const titleEl = createHeading({
        text: CONST.TEXT.FT_TRANSCENDENCE,
        tag: "h1",
        tw: "text-3xl cursor-pointer mb-0 text-left text-white",
    });

    //
    const navList = createEl("ul", "flex text-xl space-x-4");
    const navKeys: [I18nKey, Route][] = [
        [CONST.TEXT.HOME, CONST.ROUTE.HOME],
        [CONST.TEXT.PLAY, "play"],
        [CONST.TEXT.LEADERBOARD, "leaderboard"],
        [CONST.TEXT.PROFILE, "profile"],
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
        text: getText(CONST.TEXT.LANG),
        attributes: { [CONST.ATTR.I18N_TEXT]: CONST.TEXT.LANG },
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
