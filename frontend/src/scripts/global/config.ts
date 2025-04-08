const API_URL = "/api";
const ASSETS_DIR = "./assets";

const config = {
    dir: {
        asset: ASSETS_DIR,
        video: `${ASSETS_DIR}/videos`, // TODO: make consistent
        audio: `${ASSETS_DIR}/audio`,
        texture: `${ASSETS_DIR}/textures`,
    },
    url: {
        api: API_URL,
        game: `${API_URL}/game`,
        user: `${API_URL}/user`,
    },
};

export default config;
