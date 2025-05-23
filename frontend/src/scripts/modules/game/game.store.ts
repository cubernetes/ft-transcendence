import { GameMode, Status, defaultGameConfig } from "@darrenkuro/pong-core";
import { createStore } from "../../global/store";
import { createGameController } from "./game.controller";

// What other data should be stored? start time? duration? names?
type GameState = {
    isPlaying: boolean;
    mode: GameMode | null;
    status: Status | null;
    playerNames: string[];
    lobbyId: string;
    lobbyHost: boolean;
    playTo: number;
    controller: ReturnType<typeof createGameController> | null;
};

export const defaultGameState: GameState = {
    isPlaying: false,
    mode: null,
    status: null,
    playerNames: ["", ""],
    lobbyId: "",
    lobbyHost: false,
    playTo: defaultGameConfig.playTo,
    controller: null,
};

export const gameStore = createStore<GameState>(defaultGameState);
