type Callback = () => void;

const listeners: Callback[] = [];

export function subscribeLanguageChange(cb: Callback): () => void {
    listeners.push(cb);
    return () => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
    };
}

export function notifyLanguageChange(): void {
    for (const listener of listeners) {
        listener();
    }
}

export let currentLang: "en" | "de" = "en";

export function switchLanguage() {
    currentLang = currentLang === "en" ? "de" : "en";
    notifyLanguageChange();
}

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
};
