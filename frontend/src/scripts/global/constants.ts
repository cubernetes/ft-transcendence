import type { Route } from "./router";
import { TEXT } from "../modules/locale/locale.translation";

// Directories
const ASSETS_DIR = "./assets";

const DIR = {
    ASSET: ASSETS_DIR,
    VIDEO: `${ASSETS_DIR}/videos`, // TODO: make consistent
    AUDIO: `${ASSETS_DIR}/audio`,
    TEXTURE: `${ASSETS_DIR}/textures`,
    TILE: `${ASSETS_DIR}/textures/tiles`,
};

// API endpoints
const BACKEND_API_URL = "/api";
const USER_API_URL = `${BACKEND_API_URL}/user`;
const LOBBY_API_URL = `${BACKEND_API_URL}/lobby`;
const TOTP_API_URL = `${BACKEND_API_URL}/totp`;
const API = {
    LOGIN: `${USER_API_URL}/login`,
    LOGOUT: `${USER_API_URL}/logout`,
    REGISTER: `${USER_API_URL}/register`,
    ME: `${USER_API_URL}/me`,
    LEADERBOARD: `${USER_API_URL}/leaderboard`,
    AVATAR: `${USER_API_URL}/avatar`,

    CREATE_LOBBY: `${LOBBY_API_URL}/create`,
    UPDATE_LOBBY: `${LOBBY_API_URL}/update`,
    LEAVE: `${LOBBY_API_URL}/leave`,
    JOIN: `${LOBBY_API_URL}/join`,

    SETUP_2FA: `${TOTP_API_URL}/setup`,
    VERIFY_2FA: `${TOTP_API_URL}/verify`,
    UPDATE_2FA: `${TOTP_API_URL}/update`,
    DISABLE_2FA: `${TOTP_API_URL}/disable`,

    USER: `${BACKEND_API_URL}/user`,
    TOTP: `${BACKEND_API_URL}/totp`,
    LOBBY: `${BACKEND_API_URL}/lobby`,
};

// Routes
const ROUTE = {
    HOME: "play" as Route, // Temporarily, should probably be profile?
    DEFAULT: "landing" as Route, // For invalid route, de facto 404
};

// Storage keys
const KEY = {
    LANG: "lang", // Language preference key in local storage
    BGM: "bgm",
    SFX: "sfx",
    SHADOWS: "shadows",
};

// Class for HTML elements
const CLASS = {
    ACTIVE_BTN: "active-btn", // Class name for active (selected) button in the group
};

// IDs for HTML elements
const ID = {
    LOGIN_FORM: "login-form",
    TOTP_FORM: "totp-form",
    TOTP_TOKEN: "totp-token", // Using
    TOTP_NEW_TOKEN: "totp-new-token", // Using
    SETUP_CTN: "setup-ctn", // NOT using?
    LOBBY_CTN: "lobby-ctn",
    LOBBY_P1: "lobby-p1",
    LOBBY_P2: "lobby-p2",
    CFG_PLAYTO: "cfg-playto",
    USER_STATUS: "user-status",
    ROOT: "app",
    HEADER: "header-ctn",
    CANVAS: "rendering-canvas",
    ROUTER: "router-ctn",
    FOOTER: "footer-ctn",
};

// Attribute keys for HTML elements
const ATTR = {
    I18N_TEXT: "data-i18n-key", // Key in props indicating textContext needs translation
    I18N_INPUT: "data-i18n-placeholder", // Key in props indicating placeholder needs translation (Input)
    I18N_ALT: "data-i18n-attr-alt", // Key in props indicating alt prop needs translation (Image)
    I18N_VARS: "data-i18n-vars", // For dynamic translate variables
    PLAYER_STATUS: "data-player-status",
};

// TODO: Move to game controller? Make them customizable?
// Controls
const L_UP = ["w"]; // Left player up key
const L_DOWN = ["s"]; // Left player down key
const R_UP = ["ArrowUp"]; // Right player up key
const R_DOWN = ["ArrowDown"]; // Right player down key

const CTRL = {
    L_UP, // For local, i.e. left paddle up
    L_DOWN,
    R_UP,
    R_DOWN,
    UP: [...L_UP, ...R_UP], // For online or ai, all would work
    DOWN: [...L_DOWN, ...R_DOWN],
    LEFT: [...L_UP, ...L_DOWN], // Left player keys
    RIGHT: [...R_UP, ...R_DOWN], // Right player keys
    ALL: [...L_UP, ...L_DOWN, ...R_UP, ...R_DOWN], // All paddle control keys
};

/** Constants will be attached globally, can be accessed via `CONST` */
export const CONSTANTS = { DIR, API, ROUTE, KEY, CLASS, ID, ATTR, CTRL, TEXT };
