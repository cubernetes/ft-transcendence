const API_URL = "/api";
const ASSETS_DIR = "./assets";

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
};

export default config;
