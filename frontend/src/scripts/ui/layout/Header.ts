import { TranslationKey, changeLanguage, getText, languageStore } from "../../global/language";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { appendUserStatus } from "./UserStatus";

export const createHeader = (header: HTMLElement): HTMLElement => {
    let unsubscribeAuth: () => void;
    let unsubscribeLanguage: () => void;

    const translatableElements: Partial<Record<TranslationKey, HTMLElement>> = {};

    const build = () => {
        header.innerHTML = "";

        // Title
        const anchor = createEl("a", "text-3xl font-bold", {
            text: getText("title"),
            events: {
                click: (e) => {
                    e.preventDefault();
                    navigateTo(window.cfg.url.home);
                },
            },
        });
        translatableElements["title"] = anchor;

        const title = createEl("h1", "", { children: [anchor] });

        const navList = createEl("ul", "flex text-1xl space-x-4");

        const navKeys: [keyof typeof translatableElements, string][] = [
            ["home", window.cfg.url.home],
            ["setup", window.cfg.url.home],
            ["game", "localgame"],
            ["online", "onlinegame"],
            ["ai", "aigame"],
            ["leaderboard", "leaderboard"],
            ["profile", "profile"],
            ["TOTP", "totp"],
        ];

        for (const [key, route] of navKeys) {
            const link = createEl("a", "hover:underline", {
                text: getText(key),
                events: {
                    click: (e) => {
                        e.preventDefault();
                        navigateTo(route);
                    },
                },
            });
            translatableElements[key] = link;
            const li = createEl("li", "", { children: [link] });
            navList.appendChild(li);
        }

        // User login status
        const loginStatus = createEl("li");
        navList.appendChild(loginStatus);

        const currentAuthState = authStore.get();
        if (currentAuthState.isAuthenticated && currentAuthState.username) {
            appendUserStatus(loginStatus, currentAuthState.username);
        }

        if (unsubscribeAuth) unsubscribeAuth();
        unsubscribeAuth = authStore.subscribe((state) => {
            window.log.debug("AuthStore triggered in header");
            loginStatus.innerHTML = "";
            if (state.isAuthenticated && state.username) {
                appendUserStatus(loginStatus, state.username);
            }
        });

        // Language toggle
        const languageButton = createEl("button", "hover:underline", {
            text: getText("lang"),
            events: {
                click: (e) => {
                    changeLanguage();
                },
            },
        });
        translatableElements["lang"] = languageButton;

        const nav = createEl("nav", "flex items-center space-x-6", {
            children: [navList, languageButton],
        });

        appendChildren(header, [title, nav]);
    };

    build();

    unsubscribeLanguage = languageStore.subscribe(() => {
        (Object.keys(translatableElements) as TranslationKey[]).forEach((key) => {
            const el = translatableElements[key];
            if (el) {
                el.textContent = getText(key);
            }
        });
    });

    header.addEventListener("destroy", () => {
        window.log.debug("Header unsubscribe to Login status and LanguageStore");
        if (unsubscribeAuth) unsubscribeAuth();
        if (unsubscribeLanguage) unsubscribeLanguage();
    });

    return header;
};
