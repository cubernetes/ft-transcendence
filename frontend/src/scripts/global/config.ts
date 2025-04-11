const API_URL = "/api";
const ASSETS_DIR = "./assets";

// Game key controls, maybe customizable later?
const L_UP = ["w"];
const L_DOWN = ["s"];
const R_UP = ["ArrowUp"];
const R_DOWN = ["ArrowDown"];

/** This variable will be attached globally, can be accessed via `window.cfg' */
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
        home: `#setup`, // Temporarily, should probably be profile?
        default: `#landing`, // For invalid route, de facto 404
    },
    label: {
        activeBtn: "activeBtn",
        token: "token", // JWT token name
    },
    id: {
        loginForm: "login-form",
        totpForm: "totp-form",
        totpToken: "totp-token", // TotpToken
        userStatus: "user-status",
        app: "app",
        header: "header-ctn",
        canvas: "rendering-canvas", // persist this so that you don't need to recreate engine
        router: "router-ctn",
        footer: "fotter-ctn",
    },
    key: {
        lup: [...L_UP], // For local, left paddle up
        ldown: [...L_DOWN],
        rup: [...R_UP],
        rdown: [...R_DOWN],
        up: [...L_UP, ...R_UP], // For Remote or AI, all would work
        down: [...L_DOWN, ...R_DOWN], // For Remote or AI
        left: [...L_UP, ...L_DOWN], // Left player keys
        right: [...R_UP, ...R_DOWN], // Right player keys
        paddle: [...L_UP, ...L_DOWN, ...R_UP, ...R_DOWN], // all paddle control keys
    },
};

export default config;
