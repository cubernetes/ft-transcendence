import { logout } from "../modules/auth/auth.service";
import { createStore } from "./store";

type LanguageState = {
    language: "en" | "de"; // | "fr" | "es" ;
};

export const languageStore = createStore<LanguageState>({ language: "en" });

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

export const texts = {
    en: {
        home: "Home",
        setup: "Setup",
        game: "Game",
        online: "Online",
        ai: "AI",
        leaderboard: "Leaderboard",
        profile: "Profile",
        TOTP: "TOTP",
        title: "ft-transcendence",
        chooseMode: "Choose Game Mode",
        local: "Local",
        aiMode: "AI",
        logout: "Logout",
        setup_choose_mode: "Choose Game Mode",
        setup_local: "Local",
        setup_ai: "AI",
        setup_online: "Play Online",
        setup_tournament_mode: "Tournament Mode",
        setup_play_local: "Play Local",
        enter_names: "Enter player names:",
        setup_play: "Play",
        difficulty: "Difficulty",
        select_Difficulty: "Please select a difficulty.",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        create_lobby: "Create Lobby",
        join_lobby: "Join Lobby",
        play_ai: "Play AI",
        player_names_required: "Please enter names for both players.",
        start_tournament: "Start Tournament",
        create_tournament: "Create a tournament",
        player_number: "Player Number",
        select_player_amount: "Please select an amount of players.",
        initialize_controller: "Game controller not initialized.",
        name_player: "Name Player", // This can be combined with a number
        tournament_mode: "Tournament Mode",
        please_enter_name: "Please enter a name for Player",
    },
    de: {
        home: "Startseite",
        setup: "Einrichtung",
        game: "Spiel",
        online: "Online",
        ai: "KI",
        leaderboard: "Bestenliste",
        profile: "Profil",
        TOTP: "TOTP",
        title: "zv-Überschreitung",
        chooseMode: "Spielmodus wählen",
        local: "Lokal",
        aiMode: "KI-Modus",
        logout: "Abmelden",
        setup_choose_mode: "Spielmodus wählen",
        setup_local: "Lokal",
        setup_ai: "KI",
        setup_online: "Online spielen",
        setup_tournament_mode: "Turniermodus",
        setup_play_local: "Lokal spielen",
        enter_names: "Spielernamen eingeben:",
        setup_play: "Spielen",
        difficulty: "Schwierigkeit",
        select_Difficulty: "Wähle eine Schwierigkeit.",
        easy: "Einfach",
        medium: "Mittel",
        hard: "Schwer",
        create_lobby: "Lobby erstellen",
        join_lobby: "Lobby beitreten",
        play_ai: "Gegen KI spielen",
        player_names_required: "Bitte geben Sie Namen für beide Spieler ein.",
        start_tournament: "Turnier starten",
        create_tournament: "Ein Turnier erstellen",
        player_number: "Spieleranzahl",
        select_player_amount: "Bitte wählen Sie eine Anzahl von Spielern aus.",
        initialize_controller: "Spielcontroller nicht initialisiert.",
        name_player: "Spieler benennen",
        tournament_mode: "Turniermodus",
        please_enter_name: "Bitte geben Sie einen Namen für Spieler",
    },
} as const;

export type TranslationKey = keyof typeof texts.en;
