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

export const getText = (key: TranslationKey | string): string => {
    const lang = languageStore.get().language;
    const translation = texts[lang][key as TranslationKey];
    if (translation) {
        return translation;
    }

    // Fallback logic for dynamic keys like name_player_X
    if (key.startsWith("name_player_")) {
        const playerNumber = key.split("_").pop(); // Extract the number after "name_player_"
        const baseTranslation = texts[lang]["name_player"];
        return baseTranslation ? `${baseTranslation} ${playerNumber}` : `Player ${playerNumber}`;
    }

    console.warn(`Missing translation for key: ${key}`);
    return key; // Return the key itself as a last resort
};

export const texts = {
    en: {
        games_played: "Games Played",
        wins: "Wins",
        losses: "Losses",
        not_enough_data: "Not enough data to generate chart.",
        failed_generate_chart: "Failed to generate chart.",
        your_stats: "Your Stats:",
        rank: "Rank",
        your_profile: "Your Profile",
        profile_picture: "Player Profile Picture",
        failed_query: "Failed to query user data.",
        username: "Username",
        display_name: "Display Name",
        password: "Password",
        confirm_password: "Confirm Password",
        login: "Login",
        register: "Register",
        quickplay: "Quickplay",
        logout: "Logout",
        passw_not_match: "Passwords do not match.",
        login_failed: "Login failed. Please check your credentials.",
        register_failed: "Registration failed. Please try again.",
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
        aiMode: "AI-Mode",
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
        name_player: "Name Player ",
        tournament_mode: "Tournament Mode",
        please_enter_name: "Please enter a name for Player",
    },
    de: {
        games_played: "Gespielte Spiele",
        wins: "Siege",
        losses: "Niederlagen",
        not_enough_data: "Nicht genügend Daten, um das Diagramm zu generieren.",
        failed_generate_chart: "Fehler beim Generieren des Diagramms.",
        your_stats: "Deine Statistiken:",
        rank: "Rang",
        your_profile: "Dein Profil",
        profile_picture: "Spieler-Profilbild",
        failed_query: "Fehler beim Abrufen der Benutzerdaten.",
        username: "Nutzername",
        display_name: "Anzeigename",
        password: "Passwort",
        confirm_password: "Passwort bestätigen",
        login: "Einloggen",
        register: "Registrieren",
        quickplay: "Schnelles Spiel",
        logout: "Abmelden",
        passw_not_match: "Passwörter stimmen nicht überein.",
        login_failed: "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldeinformationen.",
        register_failed: "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
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
        name_player: "Benenne Spieler ",
        tournament_mode: "Turniermodus",
        please_enter_name: "Bitte geben Sie einen Namen für Spieler",
    },
} as const;

export type TranslationKey = keyof typeof texts.en;
