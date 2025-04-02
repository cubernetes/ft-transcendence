import type { logLevel } from "./utils/logger";

export const ASSETS_DIR = "./assets";

export const API_URL = "/api";
export const GAME_URL = `${API_URL}/game`;
export const GAME_CONFIG_URL = `${GAME_URL}/config`;
export const USER_URL = `${API_URL}/user`;

// Set the log level for development mode
export const LOG_LEVEL: logLevel = "debug";
