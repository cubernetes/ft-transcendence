// import { createStore } from "./store";

// const SUPPORTED_LANGS = ["en", "de", "fr", "es"] as const;
// export type Languages = (typeof SUPPORTED_LANGS)[number];

// const isLangSupported = (x: unknown): x is Languages => {
//     return typeof x === "string" && SUPPORTED_LANGS.includes(x as Languages);
// };

// type LanguageState = { lang: Languages };

// const getInitLang = (): Languages => {
//     // Check local storage for stored language preference
//     const key = window.cfg.label.lang;
//     const stored = localStorage.getItem(key);
//     if (stored && isLangSupported(stored)) return stored;

//     // Loop through browser language preference and see if any is available
//     for (const tag of navigator.languages) {
//         const locale = new Intl.Locale(tag);
//         const langCode = locale.language;
//         if (isLangSupported(langCode)) return langCode;
//     }

//     // Default to English if all else fails
//     return "en";
// };

// export const languageStore = createStore<LanguageState>({ lang: getInitLang() });

// export const setLanguage = (lang: Languages) => {
//     localStorage.setItem(window.cfg.label.lang, lang);
//     languageStore.set({ lang });
// };

// // Circle through available languages
// export const changeLanguage = () => {
//     const availableLanguages: Languages[] = ["en", "de", "fr", "es"];
//     const currentLang = languageStore.get().lang;
//     const nextLangIndex = (availableLanguages.indexOf(currentLang) + 1) % availableLanguages.length;
//     const nextLang = availableLanguages[nextLangIndex];
//     setLanguage(nextLang);
// };

// export const getText = (key: TextKey): string => {
//     const { lang } = languageStore.get();
//     return texts[lang][key];
// };

// // export const getText = (key: TranslationKey | string): string => {
// //     const lang = languageStore.get().lang;
// //     const translation = texts[lang][key as TranslationKey];
// //     if (translation) {
// //         return translation;
// //     }

// //     // Fallback logic for dynamic keys like name_player_X
// //     if (key.startsWith("name_player_")) {
// //         const playerNumber = key.split("_").pop(); // Extract the number after "name_player_"
// //         const baseTranslation = texts[lang]["name_player"];
// //         return baseTranslation ? `${baseTranslation} ${playerNumber}` : `Player ${playerNumber}`;
// //     }

// //     log.warn(`Missing translation for key: ${key}`);
// //     return key; // Return the key itself as a last resort
// // };

// const en = {
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
//     setup_choose_mode: "Choose Game Mode",
//     setup_local: "Local",
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
//     code_default: "Translation Needed", // Needs attention to replace, for type reasons
// } as const;
// export type TextKey = keyof typeof en;

// export const texts = {
//     en,
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
//         code_default: "Translation Needed", // Needs attention to replace, for type reasons
//     } satisfies { [K in TextKey]: string },
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
//         code_default: "Translation Needed", // Needs attention to replace, for type reasons
//     } satisfies { [K in TextKey]: string },
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
//         code_default: "Translation Needed", // Needs attention to replace, for type reasons
//     } satisfies { [K in TextKey]: string },
// } as const;
