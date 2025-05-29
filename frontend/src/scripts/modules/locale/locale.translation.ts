import {
    DISPLAY_NAME_MIN_LENGTH,
    PASSWORD_MIN_LENGTH,
    USERNAME_MIN_LENGTH,
} from "@darrenkuro/pong-core";
import { LanguageOpts } from "./locale.store";

export const TEXT_MAP = {
    // Header
    FT_TRANSCENDENCE: {
        en: "ft-transcendence",
        de: "zv-Transzendenz",
        fr: "qd-transcendance",
        es: "cd-transcendencia",
    },
    PLAY: {
        en: "Play",
        de: "Spielen",
        fr: "Jouer",
        es: "Jugar",
    },
    LEADERBOARD: {
        en: "Leaderboard",
        de: "Bestenliste",
        fr: "Classement",
        es: "Clasificación",
    },
    PROFILE: {
        en: "Profile",
        de: "Profil",
        fr: "Profil",
        es: "Perfil",
    },
    STATS: {
        en: "Stats",
        de: "Statistiken",
        fr: "Statistiques",
        es: "Estadísticas",
    },
    QUICKPLAY: {
        en: "Quickplay",
        de: "Schnelles Spiel",
        fr: "Jeu rapide",
        es: "Juego rápido",
    },

    // System
    COPY: {
        en: "Copy",
        de: "Kopieren",
        fr: "Copier",
        es: "Copiar",
    },
    COPIED: {
        en: "Copied",
        de: "Kopiert",
        fr: "Copié",
        es: "Copiado",
    },
    UPLOAD: {
        en: "Upload",
        de: "Hochladen",
        fr: "Téléverser",
        es: "Subir",
    },
    SUCCESS: {
        en: "Success",
        de: "Erfolg",
        fr: "Succès",
        es: "Éxito",
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
    PASSWORD: {
        en: "Password",
        de: "Passwort",
        fr: "Mot de passe",
        es: "Contraseña",
    },
    OLD_PASSWORD: {
        en: "Old password",
        de: "Altes Passwort",
        fr: "Ancien mot de passe",
        es: "Contraseña anterior",
    },
    NEW_PASSWORD: {
        en: "New password",
        de: "Neues Passwort",
        fr: "Nouveau mot de passe",
        es: "Nueva contraseña",
    },
    CONFIRM_PASSWORD: {
        en: "Confirm password",
        de: "Passwort bestätigen",
        fr: "Confirmer le mot de passe",
        es: "Confirmar contraseña",
    },
    LOGIN: {
        en: "Login",
        de: "Einloggen",
        fr: "Connexion",
        es: "Iniciar sesión",
    },
    LOGOUT: {
        en: "Logout",
        de: "Abmelden",
        fr: "Déconnexion",
        es: "Cerrar sesión",
    },
    REGISTER: {
        en: "Register",
        de: "Registrieren",
        fr: "S'inscrire",
        es: "Registrarse",
    },
    USER_AVATAR: {
        en: "User avatar",
        de: "Benutzeravatar",
        fr: "Avatar utilisateur",
        es: "Avatar de usuario",
    },
    GAMES_PLAYED: {
        en: "Played Games",
        de: "Gespielte Spiele",
        fr: "Parties jouées",
        es: "Juegos jugados",
    },
    RANK: {
        en: "Rank",
        de: "Rang",
        fr: "Rang",
        es: "Rango",
    },
    WINS: {
        en: "Wins",
        de: "Siege",
        fr: "Victoires",
        es: "Victorias",
    },
    LOSSES: {
        en: "Losses",
        de: "Niederlagen",
        fr: "Défaites",
        es: "Derrotas",
    },
    UPDATE: {
        en: "Update",
        de: "Aktualisieren",
        fr: "Mettre à jour",
        es: "Actualizar",
    },
    ENABLE: {
        en: "Enable",
        de: "Aktivieren",
        fr: "Activer",
        es: "Habilitar",
    },
    DISABLE: {
        en: "Disable",
        de: "Deaktivieren",
        fr: "Désactiver",
        es: "Deshabilitar",
    },
    SUBMIT: {
        en: "Submit",
        de: "Absenden",
        fr: "Soumettre",
        es: "Enviar",
    },
    ENTER_TOTP_CODE: {
        en: "Enter TOTP code",
        de: "TOTP-Code eingeben",
        fr: "Entrer le code TOTP",
        es: "Introduzca el código TOTP",
    },
    ENTER_TOTP_CODE_NEW: {
        en: "Enter TOTP code for new secret",
        de: "TOTP-Code für neues Geheimnis eingeben",
        fr: "Entrer le code TOTP pour le nouveau secret",
        es: "Introduzca el código TOTP para el nuevo secreto",
    },

    // Game setup
    CHOOSE_GAME_MODE: {
        en: "Choose Game Mode",
        de: "Spielmodus wählen",
        fr: "Choisir le mode de jeu",
        es: "Elegir modo de juego",
    },
    LOCAL: {
        en: "Local",
        de: "Lokal",
        fr: "Local",
        es: "Local",
    },
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
    AI: {
        en: "AI",
        de: "KI",
        fr: "IA",
        es: "IA",
    },
    DIFFICULTY: {
        en: "Difficulty",
        de: "Schwierigkeit",
        fr: "Difficulté",
        es: "Dificultad",
    },
    EASY: {
        en: "Easy",
        de: "Einfach",
        fr: "Facile",
        es: "Fácil",
    },
    MEDIUM: {
        en: "Medium",
        de: "Mittel",
        fr: "Moyen",
        es: "Medio",
    },
    HARD: {
        en: "Hard",
        de: "Schwer",
        fr: "Difficile",
        es: "Difícil",
    },

    ONLINE: {
        en: "Online",
        de: " Online",
        fr: "En ligne",
        es: "En línea",
    },
    LOBBY: {
        en: "Lobby",
        de: "Lobby",
        fr: "Salon",
        es: "Sala",
    },
    ENTER_LOBBY_ID: {
        en: "Enter lobby ID",
        de: "Lobby-ID eingeben",
        fr: "Entrer l'identifiant du salon",
        es: "Ingrese el ID de la sala",
    },
    JOIN: {
        en: "Join",
        de: "Beitreten",
        fr: "Rejoindre",
        es: "Unirse",
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
    LEAVE: {
        en: "Leave",
        de: "Verlassen",
        fr: "Quitter",
        es: "Salir",
    },
    TOURNAMENT: {
        en: "Tournament",
        de: "Turnier",
        fr: "Tournoi",
        es: "Torneo",
    },
    TOURNAMENT_ID: {
        en: "Tournament ID: {id}",
        de: "Turnier ID: {id}",
        fr: "Tournoi ID: {id}",
        es: "Torneo ID: {id}",
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
        de: "Spieleranzahl",
        fr: "Nombre de joueurs",
        es: "Número de jugadores",
    },
    COMPLETED: {
        en: "Completed",
        de: "Abgeschlossen",
        fr: "Terminé",
        es: "Completado",
    },
    PENDING: {
        en: "Pending",
        de: "Ausstehend",
        fr: "En attente",
        es: "Pendiente",
    },
    WINNER: {
        en: "Winner",
        de: "Gewinner",
        fr: "Vainqueur",
        es: "Ganador",
    },
    WINNER_NAME: {
        en: "{icon} Winner: {name}",
        de: "{icon} Sieger: {name}",
        fr: "{icon} Vainqueur: {name}",
        es: "{icon} Ganador: {name}",
    },
    START: {
        en: "Start",
        de: "Starten",
        fr: "Démarrer",
        es: "Iniciar",
    },
    TOURNAMENT_BRACKET: {
        en: "{icon} Tournament Bracket",
        de: "{icon} Turnierbaum",
        fr: "{icon} Arbre du tournoi",
        es: "{icon} Cuadro del torneo",
    },
    WALLET_CONNECT: {
        en: "{icon} Store Results on the Blockchain",
        de: "{icon} Ergebnisse auf der Blockchain speichern",
        fr: "{icon} Stocker les résultats sur la blockchain",
        es: "{icon} Guardar resultados en la blockchain",
    },
    GET_TOURNAMENT: {
        en: "{icon} Get Tournament History",
        de: "{icon} Turnierverlauf abrufen",
        fr: "{icon} Obtenir l'historique du tournoi",
        es: "{icon} Obtener historial del torneo",
    },
    RECORD_TOURNAMENT: {
        en: "{icon} Record Game",
        de: "{icon} Spiel aufzeichnen",
        fr: "{icon} Enregistrer la partie",
        es: "{icon} Registrar partida",
    },
    RESTART: {
        en: "{icon} Restart",
        de: "{icon} Neustarten",
        fr: "{icon} Redémarrer",
        es: "{icon} Reiniciar",
    },

    // Stats and profiles
    STATS_CHART: {
        en: "Stats Chart",
        de: "Statistikdiagramm",
        fr: "Graphique des statistiques",
        es: "Gráfico de estadísticas",
    },
    MATCH_HISTORY: {
        en: "Match History",
        de: "Spielverlauf",
        fr: "Historique des matchs",
        es: "Historial de partidas",
    },
    FRIENDS: {
        en: "Your Friends",
        de: "Deine Freunde",
        fr: "Vos amis",
        es: "Tus amigos",
    },
    // Game options
    SHADOWS: {
        en: "Shadows",
        de: "Schatten",
        fr: "Ombres",
        es: "Sombras",
    },
    MUSIC: {
        en: "Music",
        de: "Musik",
        fr: "Musique",
        es: "Música",
    },
    VOLUME: {
        en: "Volume",
        de: "Lautstärke",
        fr: "Volume",
        es: "Volumen",
    },
    GAME_OVER: {
        en: "Game over",
        de: "Spiel vorbei",
        fr: "Partie terminée",
        es: "Fin del juego",
    },
    STATUS: {
        en: "Status",
        de: "Status",
        fr: "Statut",
        es: "Estado",
    },
    DATE: {
        en: "Date",
        de: "Datum",
        fr: "Date",
        es: "Fecha",
    },

    OPPONENT: {
        en: "Opponent",
        de: "Gegner",
        fr: "Adversaire",
        es: "Oponente",
    },

    RESULT: {
        en: "Result",
        de: "Ergebnis",
        fr: "Résultat",
        es: "Resultado",
    },
    SCORE: {
        en: "Score",
        de: "Punktestand",
        fr: "Score",
        es: "Puntuación",
    },
    ID_INV: {
        en: "Share this ID with your friends to join your game.",
        de: "Teile diese ID mit deinen Freunden, damit sie deinem Spiel beitreten können.",
        fr: "Partage cet identifiant avec tes amis pour qu'ils rejoignent ta partie.",
        es: "Comparte este ID con tus amigos para que se unan a tu juego.",
    },
    // Server error codes
    USER_NOT_FOUND: {
        en: "User not found",
        de: "Benutzer nicht gefunden",
        fr: "Utilisateur non trouvé",
        es: "Usuario no encontrado",
    },
    USERNAME_REQUIRED: {
        en: "Username is required",
        de: "Benutzername ist erforderlich",
        fr: "Le nom d'utilisateur est requis",
        es: "Se requiere nombre de usuario",
    },
    USERNAME_TAKEN: {
        en: "Username taken",
        de: "Benutzername bereits vergeben",
        fr: "Nom d'utilisateur déjà pris",
        es: "Nombre de usuario ya en uso",
    },
    USERNAME_TOO_SHORT: {
        en: `Username needs to be at least ${USERNAME_MIN_LENGTH} characters long`,
        de: `Der Benutzername muss mindestens ${USERNAME_MIN_LENGTH} Zeichen lang sein`,
        fr: `Le nom d'utilisateur doit comporter au moins ${USERNAME_MIN_LENGTH} caractères`,
        es: `El nombre de usuario debe tener al menos ${USERNAME_MIN_LENGTH} caracteres`,
    },
    DISPLAY_NAME_TOO_SHORT: {
        en: `Display name needs to be at least ${DISPLAY_NAME_MIN_LENGTH} characters long`,
        de: `Der Anzeigename muss mindestens ${DISPLAY_NAME_MIN_LENGTH} Zeichen lang sein`,
        fr: `Le nom d'affichage doit comporter au moins ${DISPLAY_NAME_MIN_LENGTH} caractères`,
        es: `El nombre para mostrar debe tener al menos ${DISPLAY_NAME_MIN_LENGTH} caracteres`,
    },
    PASSWORD_REQUIRED: {
        en: "Password is required",
        de: "Passwort ist erforderlich",
        fr: "Le mot de passe est requis",
        es: "Se requiere contraseña",
    },
    PASSWORD_INVALID: {
        en: "Invalid password",
        de: "Ungültiges Passwort",
        fr: "Mot de passe invalide",
        es: "Contraseña inválida",
    },
    PASSWORD_TOO_SHORT: {
        en: `Password needs to be at least ${PASSWORD_MIN_LENGTH} characters long`,
        de: `Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein`,
        fr: `Le mot de passe doit comporter au moins ${PASSWORD_MIN_LENGTH} caractères`,
        es: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    },
    PASSWORD_MATCH_ERROR: {
        en: "Passwords do not match",
        de: "Passwörter stimmen nicht überein.",
        fr: "Les mots de passe ne correspondent pas.",
        es: "Las contraseñas no coinciden.",
    },
    TOKEN_REQUIRED: {
        en: "TOTP token is required",
        de: "TOTP-Token ist erforderlich",
        fr: "Le jeton TOTP est requis",
        es: "Se requiere el token TOTP",
    },
    TOKEN_LENGTH_ERROR: {
        en: "TOTP token must be 6 characters",
        de: "TOTP-Token muss 6 Zeichen lang sein",
        fr: "Le jeton TOTP doit comporter 6 caractères",
        es: "El token TOTP debe tener 6 caracteres",
    },
    TOKEN_INVALID: {
        en: "TOTP token is invalid",
        de: "TOTP-Token ist ungültig",
        fr: "Le jeton TOTP est invalide",
        es: "El token TOTP no es válido",
    },
    LOBBY_NOT_FOUND: {
        en: "Lobby not found",
        de: "Lobby nicht gefunden",
        fr: "Salon introuvable",
        es: "Sala no encontrada",
    },
    LOBBY_FULL: {
        en: "Lobby is full",
        de: "Lobby ist voll",
        fr: "Le salon est plein",
        es: "La sala está llena",
    },

    // More errors and system messages
    FETCH_ERROR: {
        en: "Fail to fetch {URL}",
        de: "Fehler beim Abrufen von {URL}",
        fr: "Échec de la récupération de {URL}",
        es: "Error al obtener {URL}",
    },
    INIT_ERROR: {
        en: "Initialization error",
        de: "Initialisierungsfehler",
        fr: "Erreur d'initialisation",
        es: "Error de inicialización",
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
        en: "Player names must be unique.",
        de: "Spielernamen dürfen nicht mehrfach gewählt werden.",
        fr: "Les noms des joueurs doivent être uniques.",
        es: "Los nombres de los jugadores no pueden estar repetidos.",
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
        de: "Kein Turnier gestartet.",
        fr: "Aucun tournoi démarré.",
        es: "Ningún torneo iniciado.",
    },
    WALLET_CONNECT_ERROR: {
        en: "{icon} Wallet not detected. Please install a wallet like MetaMask.",
        de: "{icon} Wallet nicht erkannt. Bitte installiere ein Wallet wie MetaMask.",
        fr: "{icon} Portefeuille non détecté. Veuillez installer un portefeuille comme MetaMask.",
        es: "{icon} Monedero no detectado. Por favor, instala un monedero como MetaMask.",
    },
    CHAIN_ID_ERROR: {
        en: "Connected to the wrong chain network. Please change to Avalanche Fuji.",
        de: "Mit dem falschen Chain-Netzwerk verbunden. Bitte wechsle zu Avalanche Fuji.",
        fr: "Connecté au mauvais réseau de chaîne. Veuillez changer pour Avalanche Fuji.",
        es: "Conectado a la red de cadena incorrecta. Por favor, cambia a Avalanche Fuji.",
    },
    GET_TOURNAMENT_ERROR: {
        en: "Unable to get tournament history.",
        de: "Turnierverlauf konnte nicht abgerufen werden.",
        fr: "Impossible d'obtenir l'historique du tournoi.",
        es: "No se pudo obtener el historial del torneo.",
    },
    GAME_DATA_ERROR: {
        en: "No game data available. Play some games online!",
        de: "Keine Spieldaten verfügbar. Spiele ein paar Online-Spiele!",
        fr: "Aucune donnée de jeu disponible. Jouez quelques parties en ligne !",
        es: "No hay datos de juego disponibles. ¡Juega algunas partidas en línea!",
    },
    FRIENDS_ERROR: {
        en: "No friends in your friend list. Add some!",
        de: "Keine Freunde in deiner Freundesliste. Füge welche hinzu!",
        fr: "Aucun ami dans votre liste d'amis. Ajoutez-en !",
        es: "No tienes amigos en tu lista. ¡Agrega algunos!",
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
