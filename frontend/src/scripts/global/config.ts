import type { Route } from "./router";

const API_URL = "/api";
const ASSETS_DIR = "./assets";

const L_UP = ["w"];
const L_DOWN = ["s"];
const R_UP = ["ArrowUp"];
const R_DOWN = ["ArrowDown"];

// TODO: These are constants, maybe all capital letters instead
/** This variable will be attached globally, can be accessed via `window.cfg` */
const config = {
    dir: {
        asset: ASSETS_DIR,
        video: `${ASSETS_DIR}/videos`, // TODO: make consistent
        audio: `${ASSETS_DIR}/audio`,
        texture: `${ASSETS_DIR}/textures`,
        tile: `${ASSETS_DIR}/textures/tiles`,
    },
    url: {
        api: API_URL,
        game: `${API_URL}/game`,
        user: `${API_URL}/user`,
        totp: `${API_URL}/totp`,
        home: `setup` as Route, // Temporarily, should probably be profile?
        default: `landing` as Route, // For invalid route, de facto 404
    },
    label: {
        activeBtn: "activeBtn",
        token: "token", // JWT token name
        lang: "lang", // Language preference saved in local storage
        textKey: "key", // Language key in props in custom element
    },
    id: {
        loginForm: "login-form",
        totpForm: "totp-form",
        totpToken: "totp-token", // TotpToken
        userStatus: "user-status",
        app: "app",
        header: "header-ctn",
        canvas: "rendering-canvas",
        router: "router-ctn",
        footer: "footer-ctn",
    },
    key: {
        lup: [...L_UP], // For local, i.e. left paddle up
        ldown: [...L_DOWN],
        rup: [...R_UP],
        rdown: [...R_DOWN],
        up: [...L_UP, ...R_UP], // For online or ai, all would work
        down: [...L_DOWN, ...R_DOWN],
        left: [...L_UP, ...L_DOWN], // Left player keys
        right: [...R_UP, ...R_DOWN], // Right player keys
        paddle: [...L_UP, ...L_DOWN, ...R_UP, ...R_DOWN], // All paddle control keys
    },
    TW: {
        // The default base tailwind for different elements
        BTN: "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400",
        INPUT: "w-full p-2 border border-gray-300 rounded",
    },
};

export default config;
