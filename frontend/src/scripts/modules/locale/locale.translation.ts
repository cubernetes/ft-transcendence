import {
    DISPLAY_NAME_MIN_LENGTH,
    PASSWORD_MIN_LENGTH,
    USERNAME_MIN_LENGTH,
} from "@darrenkuro/pong-core";
import { LanguageOpts } from "./locale.store";

// TODO: Check if everything here should all be lower case and let component or translate to handle capitalization for different needs
// Problem is that I am not sure if other languages have weird capitalization rules
// All caps as code to not accidentally set up something as translatable
export const TEXT_MAP = {
    // Header
    FT_TRANSCENDENCE: {
        en: "ft-transcendence",
        de: "zv-Transzendenz",
        fr: "qd-transcendance",
        es: "cd-transcendencia",
    },
    // Not sure if this makes sense to translate title
    // especially when I am thinking in the context or potentially adding non-alphabetic languages such as Chinese or Japanese
    PLAY: { en: "Play", de: "Spielen", fr: "Jouer", es: "Jugar" },
    HOME: { en: "Home", de: "Startseite", fr: "Accueil", es: "Inicio" },
    LEADERBOARD: { en: "Leaderboard", de: "Bestenliste", fr: "Classement", es: "Clasificación" },
    PROFILE: { en: "Profile", de: "Profil", fr: "Profil", es: "Perfil" },
    QUICKPLAY: { en: "Quickplay", de: "Schnelles Spiel", fr: "Jeu rapide", es: "Juego rápido" },

    // System
    COPY: {
        en: "Copy",
        de: "Copy", // TRANSLATION_NEEDED
        fr: "Copy", // TRANSLATION_NEEDED
        es: "Copy", // TRANSLATION_NEEDED
    },
    COPIED: {
        en: "Copied",
        de: "Copied", // TRANSLATION_NEEDED
        fr: "Copied", // TRANSLATION_NEEDED
        es: "Copied", // TRANSLATION_NEEDED
    },
    UPLOAD: {
        en: "Upload",
        de: "Upload", // TRANSLATION_NEEDED
        fr: "Upload", // TRANSLATION_NEEDED
        es: "Upload", // TRANSLATION_NEEDED
    },

    // User
    USERNAME: {
        en: "Username",
        de: "Nutzername",
        fr: "Nom d'utilisateur",
        es: "Nombre de usuario",
    },
    DISPLAY_NAME: {
        en: "Display name",
        de: "Anzeigename",
        fr: "Nom d'affichage",
        es: "Nombre para mostrar",
    },
    PASSWORD: { en: "Password", de: "Passwort", fr: "Mot de passe", es: "Contraseña" },
    OLD_PASSWORD: { en: "Old password", de: "Passwort", fr: "Mot de passe", es: "Contraseña" }, // TRANSLATION_NEEDED
    NEW_PASSWORD: { en: "New password", de: "Passwort", fr: "Mot de passe", es: "Contraseña" }, // TRANSLATION_NEEDED
    CONFIRM_PASSWORD: {
        en: "Confirm password",
        de: "Passwort bestätigen",
        fr: "Confirmer le mot de passe",
        es: "Confirmar contraseña",
    },
    LOGIN: { en: "Login", de: "Einloggen", fr: "Connexion", es: "Iniciar sesión" },
    LOGOUT: { en: "Logout", de: "Abmelden", fr: "Déconnexion", es: "Cerrar sesión" },
    REGISTER: { en: "Register", de: "Registrieren", fr: "S'inscrire", es: "Registrarse" },
    USER_AVATAR: {
        en: "User avatar",
        de: "User avatar", // TRANSLATION_NEEDED
        fr: "User avatar", // TRANSLATION_NEEDED
        es: "User avatar", // TRANSLATION_NEEDED
    },
    GAMES_PLAYED: {
        en: "Played Games",
        de: "Gespielte Spiele",
        fr: "Played Games",
        es: "Played Games",
    }, // TRANSLATION_NEEDED
    RANK: { en: "Rank", de: "Rang", fr: "Rang", es: "Rango" },
    WINS: { en: "Wins", de: "Siege", fr: "Victoires", es: "Victorias" },
    UPDATE: {
        en: "Update",
        de: "Update", // TRANSLATION_NEEDED
        fr: "Update", // TRANSLATION_NEEDED
        es: "Update", // TRANSLATION_NEEDED
    },
    ENABLE: {
        en: "Enable",
        de: "Enable", // TRANSLATION_NEEDED
        fr: "Enable", // TRANSLATION_NEEDED
        es: "Enable", // TRANSLATION_NEEDED
    },
    DISABLE: {
        en: "Disable",
        de: "Disable", //TRANSLATION_NEEDED
        fr: "Disable", //TRANSLATION_NEEDED
        es: "Disable", //TRANSLATION_NEEDED
    },
    SUBMIT: {
        en: "Submit",
        de: "Submit", //TRANSLATION_NEEDED
        fr: "Submit", //TRANSLATION_NEEDED
        es: "Submit", //TRANSLATION_NEEDED
    },
    ENTER_TOTP_CODE: {
        en: "Enter TOTP code",
        de: "Enter TOTP code", //TRANSLATION_NEEDED
        fr: "Enter TOTP code", //TRANSLATION_NEEDED
        es: "Enter TOTP code", //TRANSLATION_NEEDED
    },
    ENTER_TOTP_CODE_NEW: {
        en: "Enter TOTP code for new secret",
        de: "Enter TOTP code for new secret", //TRANSLATION_NEEDED
        fr: "Enter TOTP code for new secret", //TRANSLATION_NEEDED
        es: "Enter TOTP code for new secret", //TRANSLATION_NEEDED
    },

    // Game setup
    CHOOSE_GAME_MODE: {
        en: "Choose Game Mode",
        de: "Spielmodus wählen",
        fr: "Choisir le mode de jeu",
        es: "Elegir modo de juego",
    },
    LOCAL: { en: "Local", de: "Lokal", fr: "Local", es: "Local" },
    ENTER_PLAYER_NAMES: {
        en: "Enter player names:",
        de: "Spielernamen eingeben:",
        fr: "Entrez les noms des joueurs :",
        es: "Ingrese los nombres de los jugadores:",
    },
    NAME_PLAYER: {
        en: "Name player {i}",
        de: "Benenne Spieler {i}",
        fr: "Nom du joueur {i}",
        es: "Nombre del jugador {i}",
    },
    AI: { en: "AI", de: "KI", fr: "IA", es: "IA" },
    DIFFICULTY: { en: "Difficulty", de: "Schwierigkeit", fr: "Difficulté", es: "Dificultad" },
    EASY: { en: "Easy", de: "Einfach", fr: "Facile", es: "Fácil" },
    MEDIUM: { en: "Medium", de: "Mittel", fr: "Moyen", es: "Medio" },
    HARD: { en: "Hard", de: "Schwer", fr: "Difficile", es: "Difícil" },

    ONLINE: { en: "Online", de: " Online", fr: "En ligne", es: "En línea" },
    LOBBY: {
        en: "Lobby",
        de: "Lobby", // TRANSLATION_NEEDED?
        fr: "Lobby", // TRANSLATION_NEEDED
        es: "Lobby", // TRANSLATION_NEEDED
    },
    ENTER_LOBBY_ID: {
        en: "Enter lobby ID",
        de: "Enter lobby ID", // TRANSLATION_NEEDED
        fr: "Enter lobby ID", // TRANSLATION_NEEDED
        es: "Enter lobby ID", // TRANSLATION_NEEDED
    },
    JOIN: {
        en: "Join",
        de: "Join", // TRANSLATION_NEEDED
        fr: "Join", // TRANSLATION_NEEDED
        es: "Join", // TRANSLATION_NEEDED
    },
    CREATE_LOBBY: {
        en: "Create Lobby",
        de: "Lobby erstellen",
        fr: "Créer un salon",
        es: "Crear sala",
    },
    JOIN_LOBBY: {
        en: "Join Lobby",
        de: "Lobby beitreten",
        fr: "Rejoindre un salon",
        es: "Unirse a la sala",
    },

    TOURNAMENT: {
        en: "Tournament",
        de: "Tournament", // TRANSLATION_NEEDED
        fr: "Tournament", // TRANSLATION_NEEDED
        es: "Tournament", // TRANSLATION_NEEDED
    },
    CREATE_TOURNAMENT: {
        en: "Create Tournament",
        de: "Ein Turnier erstellen",
        fr: "Créer un tournoi",
        es: "Crear un torneo",
    },
    START_TOURNAMENT: {
        en: "Start Tournament",
        de: "Turnier starten",
        fr: "Démarrer le tournoi",
        es: "Iniciar torneo",
    },
    NUMBER_OF_PLAYERS: {
        en: "Number of players",
        de: "Spieleranzahl", // TODO: Check if still correct
        fr: "Nombre de joueurs", // TODO: Check if still correct
        es: "Número de jugadores", // TODO: Check if stil correct
    },
    TOURNAMENT_GAME_COMPLETED: {
        en: "Completed",
        de: "Turnier starten", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    TOURNAMENT_GAME_PENDING: {
        en: "Pending",
        de: "Turnier starten", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    WINNER: {
        en: "Winner",
        de: "Gewinner",
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    START: {
        en: "Start",
        de: "Starten",
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    TOURNAMENT_BRACKET: {
        en: "Tournament Bracket",
        de: "Turnierbaum", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    WALLET_CONNECT: {
        en: "🔌 Store Results on the Blockchain",
        de: "Turnierbaum", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    GET_TOURNAMENT: {
        en: "📖 Get Tournament History",
        de: "Turnierbaum", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    RECORD_TOURNAMENT: {
        en: "📝 Record Game",
        de: "Turnierbaum", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    RESTART_TOURNAMENT: {
        en: "🔁 Start Another Tournament",
        de: "Turnierbaum", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    CHART_PERFROMANCE: {
        en: "Pong Game Performance",
        de: "Turnierbaum", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
    // Server error codes
    USER_NOT_FOUND: {
        en: "User not found",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    USERNAME_REQUIRED: {
        en: "Username is required",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    USERNAME_TAKEN: {
        en: "Username taken",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    USERNAME_TOO_SHORT: {
        en: `Username needs to be at least ${USERNAME_MIN_LENGTH} characters long`,
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    DISPLAY_NAME_TOO_SHORT: {
        en: `Display name needs to be at least ${DISPLAY_NAME_MIN_LENGTH} characters long`,
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    PASSWORD_REQUIRED: {
        en: "Password is required",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    PASSWORD_INVALID: {
        en: "Invalid password",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    PASSWORD_TOO_SHORT: {
        en: `Password needs to be at least ${PASSWORD_MIN_LENGTH} characters long`,
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    PASSWORD_MATCH_ERROR: {
        en: "Passwords do not match",
        de: "Passwörter stimmen nicht überein.",
        fr: "Les mots de passe ne correspondent pas.",
        es: "Las contraseñas no coinciden.",
    },
    TOKEN_REQUIRED: {
        en: "TOTP token is required",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    TOKEN_LENGTH_ERROR: {
        en: "TOTP token must be 6 characters",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    TOKEN_INVALID: {
        en: "TOTP token is invalid",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    LOBBY_NOT_FOUND: {
        en: "Lobby not found",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },
    LOBBY_FULL: {
        en: "Lobby is full",
        de: "Username taken", // TRANSLATION_NEEDED
        fr: "Username taken", // TRANSLATION_NEEDED
        es: "Username taken", // TRANSLATION_NEEDED
    },

    // Error CODE map to msg, probaly need refactor, do not need to be one to one with english
    FETCH_ERROR: {
        en: "Fail to fetch {URL}",
        de: "Fail to fetch {URL}", // TRANSLATION_NEEDED
        fr: "Fail to fetch {URL}", // TRANSLATION_NEEDED
        es: "Fail to fetch {URL}", // TRANSLATION_NEEDED
    },
    INIT_ERROR: {
        en: "Initialization error",
        de: "Initialization error", // TRANSLATION_NEEDED
        fr: "Initialization error", // TRANSLATION_NEEDED
        es: "Initialization error", // TRANSLATION_NEEDED
    },
    LOGIN_ERROR: {
        en: "Login failed. Please check your credentials.",
        de: "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldeinformationen.",
        fr: "Échec de la connexion. Veuillez vérifier vos identifiants.",
        es: "Error al iniciar sesión. Verifique sus credenciales.",
    },
    PLAYER_NAMES_REQUIRED: {
        en: "Please enter names for all players.",
        de: "Bitte geben Sie Namen für alle Spieler ein.",
        fr: "Veuillez entrer les noms de tous les joueurs.",
        es: "Por favor, ingrese los nombres de todos los jugadores.",
    },
    PLAYER_NAMES_DUPLICATE: {
        en: "Player names must to be unique.",
        de: "Player names must to be unique.", // TRANSLATION_NEEDED
        fr: "Player names must to be unique.", // TRANSLATION_NEEDED
        es: "Player names must to be unique.", // TRANSLATION_NEEDED
    },
    DIFFICULTY_REQUIRED: {
        en: "Please select a difficulty.",
        de: "Wähle eine Schwierigkeit.",
        fr: "Veuillez sélectionner une difficulté.",
        es: "Por favor, seleccione una dificultad.",
    },
    LOBBY_ID_REQUIRED: {
        en: "Lobby ID is required.",
        de: "Wähle eine Schwierigkeit.",
        fr: "Veuillez sélectionner une difficulté.",
        es: "Por favor, seleccione una dificultad.",
    },
    NO_TOURNAMENT: {
        en: "No tournament started.",
        de: "Kein Tournament wurde gestarted.",
        fr: "No tournament started.", // TRANSLATION_NEEDED
        es: "No tournament started.", // TRANSLATION_NEEDED
    },
    WALLET_CONNECT_ERROR: {
        en: "❌ Wallet not detected. Please install a wallet like MetaMask.",
        de: "Turnierbaum", // TRANSLATION_NEEDED
        fr: "Démarrer le tournoi", // TRANSLATION_NEEDED
        es: "Iniciar torneo", // TRANSLATION_NEEDED
    },
} as const satisfies Record<string, Record<LanguageOpts, string>>;

export type I18nKey = keyof typeof TEXT_MAP;
export const TEXT_KEYS = Object.keys(TEXT_MAP) as I18nKey[];

// Map keys to its name and add to constants
export const TEXT = TEXT_KEYS.reduce(
    (acc, key) => {
        acc[key] = key;
        return acc;
    },
    {} as Record<I18nKey, I18nKey>
);

// export const TEXT_EN = {
//     ai: "AI",
//     chooseMode: "Choose Game Mode",
//     confirm_password: "Confirm Password",
//     create_lobby: "Create Lobby",
//     create_tournament: "Create a tournament",
//     difficulty: "Difficulty",
//     display_name: "Display Name",
//     easy: "Easy",
//     enter_names: "Enter player names:",
//     failed_generate_chart: "Failed to generate chart.",
//     failed_query: "Failed to query user data.",
//     game: "Game",
//     game_id: "Game ID",
//     games_played: "Games Played",
//     hard: "Hard",
//     home: "Home",
//     initialize_controller: "Game controller not initialized.",
//     join_lobby: "Join Lobby",
//     lang: "Language: EN",
//     leaderboard: "Leaderboard",
//     local: "Local",
//     login: "Login",
//     login_failed: "Login failed. Please check your credentials.",
//     logout: "Logout",
//     medium: "Medium",
//     name_player: "Name Player ",
//     not_enough_data: "Not enough data to generate chart.",
//     online: "Online",
//     passw_not_match: "Passwords do not match.",
//     password: "Password",
//     player_names_required: "Please enter names for all players. No duplicates allowed.",
//     player_number: "Player Number",
//     please_enter_name: "Please enter a name for Player",
//     play_ai: "Play AI",
//     profile: "Profile",
//     profile_picture: "Player Profile Picture",
//     quickplay: "Quickplay",
//     rank: "Rank",
//     register: "Register",
//     register_failed: "Registration failed. Please try again.",
//     setup: "Setup",
//     setup_ai: "AI-Mode",
//     setup_choose_mode: "Choose Game Mode", // duplicate
//     setup_local: "Local", // duplicate
//     setup_online: "Play Online",
//     setup_play: "Play",
//     setup_play_local: "Play Local",
//     setup_tournament_mode: "Tournament Mode",
//     select_Difficulty: "Please select a difficulty.",
//     select_player_amount: "Please select an amount of players.",
//     start_tournament: "Start Tournament",
//     title: "ft-transcendence",
//     tournament_mode: "Tournament Mode",
//     TOTP: "TOTP",
//     username: "Username",
//     wins: "Wins",
//     your_profile: "Your Profile",
//     your_stats: "Your Stats:",
// } as const;

// export const TEXTS = {
//     en: TEXT_EN,
//     de: {
//         ai: "KI",
//         chooseMode: "Spielmodus wählen",
//         confirm_password: "Passwort bestätigen",
//         create_lobby: "Lobby erstellen",
//         create_tournament: "Ein Turnier erstellen",
//         difficulty: "Schwierigkeit",
//         display_name: "Anzeigename",
//         easy: "Einfach",
//         enter_names: "Spielernamen eingeben:",
//         failed_generate_chart: "Fehler beim Generieren des Diagramms.",
//         failed_query: "Fehler beim Abrufen der Benutzerdaten.",
//         game: "Spiel",
//         game_id: "Spiel-ID",
//         games_played: "Gespielte Spiele",
//         hard: "Schwer",
//         home: "Startseite",
//         initialize_controller: "Spielcontroller nicht initialisiert.",
//         join_lobby: "Lobby beitreten",
//         lang: "Sprache: DE",
//         leaderboard: "Bestenliste",
//         local: "Lokal",
//         login: "Einloggen",
//         login_failed: "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldeinformationen.",
//         logout: "Abmelden",
//         medium: "Mittel",
//         name_player: "Benenne Spieler ",
//         not_enough_data: "Nicht genügend Daten, um das Diagramm zu generieren.",
//         online: "Online",
//         passw_not_match: "Passwörter stimmen nicht überein.",
//         password: "Passwort",
//         player_names_required:
//             "Bitte geben Sie Namen für alle Spieler ein. Keine Duplikate erlaubt.",
//         player_number: "Spieleranzahl",
//         please_enter_name: "Bitte geben Sie einen Namen für Spieler",
//         play_ai: "Gegen KI spielen",
//         profile: "Profil",
//         profile_picture: "Spieler-Profilbild",
//         quickplay: "Schnelles Spiel",
//         rank: "Rang",
//         register: "Registrieren",
//         register_failed: "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
//         setup: "Einrichtung",
//         setup_ai: "KI-Modus",
//         setup_choose_mode: "Spielmodus wählen",
//         setup_local: "Lokal",
//         setup_online: "Online spielen",
//         setup_play: "Spielen",
//         setup_play_local: "Lokal spielen",
//         setup_tournament_mode: "Turniermodus",
//         select_Difficulty: "Wähle eine Schwierigkeit.",
//         select_player_amount: "Bitte wählen Sie eine Anzahl von Spielern aus.",
//         start_tournament: "Turnier starten",
//         title: "zv-Transzendenz",
//         tournament_mode: "Turniermodus",
//         TOTP: "TOTP",
//         username: "Nutzername",
//         wins: "Siege",
//         your_profile: "Dein Profil",
//         your_stats: "Deine Statistiken:",
//     } satisfies { [K in I18nKey]: string },
//     fr: {
//         ai: "IA",
//         chooseMode: "Choisir le mode de jeu",
//         confirm_password: "Confirmer le mot de passe",
//         create_lobby: "Créer un salon",
//         create_tournament: "Créer un tournoi",
//         difficulty: "Difficulté",
//         display_name: "Nom d'affichage",
//         easy: "Facile",
//         enter_names: "Entrez les noms des joueurs :",
//         failed_generate_chart: "Échec de la génération du graphique.",
//         failed_query: "Échec de la requête des données utilisateur.",
//         game: "Jeu",
//         game_id: "ID de jeu",
//         games_played: "Parties jouées",
//         hard: "Difficile",
//         home: "Accueil",
//         initialize_controller: "Contrôleur de jeu non initialisé.",
//         join_lobby: "Rejoindre un salon",
//         lang: "Langue : FR",
//         leaderboard: "Classement",
//         local: "Local",
//         login: "Connexion",
//         login_failed: "Échec de la connexion. Veuillez vérifier vos identifiants.",
//         logout: "Déconnexion",
//         medium: "Moyen",
//         name_player: "Nom du joueur ",
//         not_enough_data: "Pas assez de données pour générer le graphique.",
//         online: "En ligne",
//         passw_not_match: "Les mots de passe ne correspondent pas.",
//         password: "Mot de passe",
//         player_names_required: "Veuillez entrer les noms de tous les joueurs, sans doublons.",
//         player_number: "Nombre de joueurs",
//         please_enter_name: "Veuillez entrer un nom pour le joueur",
//         play_ai: "Jouer contre l'IA",
//         profile: "Profil",
//         profile_picture: "Photo de profil du joueur",
//         quickplay: "Jeu rapide",
//         rank: "Rang",
//         register: "S'inscrire",
//         register_failed: "Échec de l'inscription. Veuillez réessayer.",
//         setup: "Configuration",
//         setup_ai: "IA-Mode",
//         setup_choose_mode: "Choisir le mode de jeu",
//         setup_local: "Local",
//         setup_online: "Jouer en ligne",
//         setup_play: "Jouer",
//         setup_play_local: "Jouer en local",
//         setup_tournament_mode: "Mode tournoi",
//         select_Difficulty: "Veuillez sélectionner une difficulté.",
//         select_player_amount: "Veuillez sélectionner un nombre de joueurs.",
//         start_tournament: "Démarrer le tournoi",
//         title: "qd-transcendance",
//         tournament_mode: "Mode tournoi",
//         TOTP: "TOTP",
//         username: "Nom d'utilisateur",
//         wins: "Victoires",
//         your_profile: "Votre profil",
//         your_stats: "Vos statistiques :",
//     } satisfies { [K in I18nKey]: string },
//     es: {
//         ai: "IA",
//         chooseMode: "Elegir modo de juego",
//         confirm_password: "Confirmar contraseña",
//         create_lobby: "Crear sala",
//         create_tournament: "Crear un torneo",
//         difficulty: "Dificultad",
//         display_name: "Nombre para mostrar",
//         easy: "Fácil",
//         enter_names: "Ingrese los nombres de los jugadores:",
//         failed_generate_chart: "Error al generar el gráfico.",
//         failed_query: "Error al consultar los datos del usuario.",
//         game: "Juego",
//         game_id: "ID del juego",
//         games_played: "Juegos jugados",
//         hard: "Difícil",
//         home: "Inicio",
//         initialize_controller: "Controlador de juego no inicializado.",
//         join_lobby: "Unirse a la sala",
//         lang: "Idioma: ES",
//         leaderboard: "Clasificación",
//         local: "Local",
//         login: "Iniciar sesión",
//         login_failed: "Error al iniciar sesión. Verifique sus credenciales.",
//         logout: "Cerrar sesión",
//         medium: "Medio",
//         name_player: "Nombre del jugador ",
//         not_enough_data: "No hay suficientes datos para generar el gráfico.",
//         online: "En línea",
//         passw_not_match: "Las contraseñas no coinciden.",
//         password: "Contraseña",
//         player_names_required:
//             "Por favor, ingrese los nombres de todos los jugadores. No se permiten duplicados.",
//         player_number: "Número de jugadores",
//         please_enter_name: "Por favor, ingrese un nombre para el jugador",
//         play_ai: "Jugar contra IA",
//         profile: "Perfil",
//         profile_picture: "Foto de perfil del jugador",
//         quickplay: "Juego rápido",
//         rank: "Rango",
//         register: "Registrarse",
//         register_failed: "Error al registrarse. Por favor, inténtelo de nuevo.",
//         setup: "Configuración",
//         setup_ai: "IA-Modo",
//         setup_choose_mode: "Elegir modo de juego",
//         setup_local: "Local",
//         setup_online: "Jugar en línea",
//         setup_play: "Jugar",
//         setup_play_local: "Jugar localmente",
//         setup_tournament_mode: "Modo torneo",
//         select_Difficulty: "Por favor, seleccione una dificultad.",
//         select_player_amount: "Por favor, seleccione un número de jugadores.",
//         start_tournament: "Iniciar torneo",
//         title: "cd-transcendencia",
//         tournament_mode: "Modo torneo",
//         TOTP: "TOTP",
//         username: "Nombre de usuario",
//         wins: "Victorias",
//         your_profile: "Tu perfil",
//         your_stats: "Tus estadísticas:",
//     } satisfies { [K in I18nKey]: string },
// } as const;
