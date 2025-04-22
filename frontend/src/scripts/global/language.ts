import { createStore } from "./store";

type LanguageState = {
    language: "en" | "de"; // | "fr" | "es" ;
};

export const languageStore = createStore<LanguageState>({ language: "en" });

export const texts = {
    en: {
        home: "Home",
        setup: "Setup",
        game: "Game",
        online: "Online",
        ai: "AI",
        leaderboard: "Leaderboard",
        profile: "Profile",
        title: "ft-transcendence",
    },
    de: {
        home: "Startseite",
        setup: "Einrichtung",
        game: "Spiel",
        online: "Online",
        ai: "KI",
        leaderboard: "Bestenliste",
        profile: "Profil",
        title: "zv-Überschreitung",
    },
} as const;

export const setLanguage = (lang: LanguageState["language"]) => {
    if (!(lang in texts)) {
        console.warn(`Language '${lang}' not supported. Falling back to 'en'.`);
        lang = "en";
    }
    languageStore.set({ language: lang });
};

export const getText = (key: keyof (typeof texts)["en"]) => {
    const lang = languageStore.get().language;
    return texts[lang][key];
};
