import type { Route } from "../../global/constants";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { I18nKey } from "../../modules/locale/locale.translation";
import { getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const hydrateHeader = (headerEl: HTMLElement): HTMLElement => {
    const { TEXT, ROUTE } = CONST;

    //
    const navList = createEl("ul", `flex ${CONST.FONT.H5} space-x-4`);
    const navKeys: [I18nKey, Route][] = [
        [TEXT.PLAY, ROUTE.PLAY],
        [TEXT.LEADERBOARD, ROUTE.LEADERBOARD],
        [TEXT.PROFILE, ROUTE.PROFILE],
        [TEXT.STATS, ROUTE.STATS],
    ];

    for (const [key, route] of navKeys) {
        const link = createEl("a", "hover:underline cursor-pointer", {
            text: key,
            events: { click: () => navigateTo(route) },
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

    const navEl = createEl("nav", "flex space-x-6", {
        children: [navList],
    });

    appendChildren(headerEl, [navEl]);

    // Header is never destoryed but included for good practice
    headerEl.addEventListener("destroy", unsubscribeAuth);

    return headerEl;
};
