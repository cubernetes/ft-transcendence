import { UserInput, createPongEngine } from "@darrenkuro/pong-core";

export type PlayStyle = "normal" | "stylish" | "crazy";
export type Resolution = "80x20" | "160x40" | "240x60" | "320x80";

// Constants
export const SERVER_URL = "ws://localhost:8080/ws";
export const API_URL = "http://localhost:8080/api";
export const MENU_MUSIC = "menu";
export const NORMAL_MUSIC = "normal";
export const VICTORY_MUSIC = "victory";
export const SCORE_SOUND = "score";
export const WALL_SOUND = "wall_hit";
export const PADDLE_SOUND = "paddle_hit";
export const PLAYER_ONE = 0;
export const PLAYER_TWO = 1;
export const GAME_FETCH_ERROR_MSG = "Failed to fetch game config!";
export const GAME_START_ERROR_MSG = "Failed to start game!";
export const GAME_START_SUCCESS_MSG = "Game started successfully!";

export interface Options {
    music: boolean;
    sfx: boolean;
    playStyle: PlayStyle;
    resolution: Resolution;
    p1Keys: KeyMapping;
    p2Keys: KeyMapping;
}

export interface FieldConfig {
    termWid: number;
    termHei: number;
    scaleX: number;
    scaleZ: number;
    paddleHeight: number;
    fieldBuffer: string[][] | null;
}

export interface KeyMapping {
    up: string;
    down: string;
    stop: string;
}

export const userOptions: Options = {
    music: true,
    sfx: true,
    playStyle: "normal",
    resolution: "160x40",
    p1Keys: { up: "q", down: "a", stop: "x" },
    p2Keys: { up: "p", down: "l", stop: "m" },
};

export const defaultFieldConfig: FieldConfig = {
    termWid: 160,
    termHei: 40,
    scaleX: 8,
    scaleZ: 8 / 3,
    paddleHeight: 40 / 3,
    fieldBuffer: Array.from({ length: 40 }, () => Array(160).fill(" ")),
};

export type PlayerKey = 0 | 1;

export interface ControllerConfig {
    player: PlayerKey;
    keyMap: KeyMapping;
    onMove: (player: PlayerKey, dir: UserInput) => void;
}

export type PongEngine = ReturnType<typeof createPongEngine>;
