import { getText, languageStore, setLanguage } from "../../global/language";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const createHeader = (header: HTMLElement): HTMLElement => {
    let unsubscribeAuth: () => void;
    let unsubscribeLanguage: () => void;

    const build = () => {
        header.innerHTML = "";

        const anchor = createEl("a", "text-3xl font-bold", {
            text: getText("title"),
            events: {
                click: (e) => {
                    e.preventDefault();
                    navigateTo(window.cfg.url.home);
                },
            },
        });

        const title = createEl("h1", "", { children: [anchor] });

        const navItems = {
            [getText("home")]: window.cfg.url.home,
            [getText("setup")]: window.cfg.url.home,
            [getText("game")]: "localgame",
            [getText("online")]: "onlinegame",
            [getText("ai")]: "aigame",
            [getText("leaderboard")]: "leaderboard",
            [getText("profile")]: "profile",
            TOTP: "totp",
        };

        const navList = createEl("ul", "flex text-1xl space-x-4");

        for (const [label, route] of Object.entries(navItems)) {
            const link = createEl("a", "hover:underline", {
                text: label,
                events: {
                    click: (e) => {
                        e.preventDefault();
                        navigateTo(route);
                    },
                },
            });
            const li = createEl("li", "", { children: [link] });
            navList.appendChild(li);
        }

        const loginStatus = createEl("li");
        navList.appendChild(loginStatus);

        const currentAuthState = authStore.get();
        if (currentAuthState.isAuthenticated && currentAuthState.username) {
            appendUserStatus(loginStatus, currentAuthState.username);
        }

        if (unsubscribeAuth) unsubscribeAuth();
        unsubscribeAuth = authStore.subscribe((state) => {
            window.log.debug("AuthStore triggered in header");
            loginStatus.innerHTML = ""; // Clear old content
            if (state.isAuthenticated && state.username) {
                appendUserStatus(loginStatus, state.username);
            }
        });

        const languageButton = createEl("button", "hover:underline", {
            text: "EN/DE",
            events: {
                click: (e) => {
                    window.log.debug("Language button clicked");
                    const currentLang = languageStore.get().language;
                    const nextLang = currentLang === "en" ? "de" : "en";
                    setLanguage(nextLang);
                },
            },
        });

        const nav = createEl("nav", "flex items-center space-x-6", {
            children: [navList, languageButton],
        });

        appendChildren(header, [title, nav]);
    };

    build();

    unsubscribeLanguage = languageStore.subscribe(() => {
        window.log.debug("LanguageStore triggered -> rebuild header");
        build();
    });

    header.addEventListener("destroy", () => {
        window.log.debug("Header unsubscribe to Login status and LanguageStore");
        if (unsubscribeAuth) unsubscribeAuth();
        if (unsubscribeLanguage) unsubscribeLanguage();
    });

    return header;
};
