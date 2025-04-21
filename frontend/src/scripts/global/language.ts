export let currentLang: "en" | "de" = "en";

export function switchLanguage() {
    currentLang = currentLang === "en" ? "de" : "en";
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
