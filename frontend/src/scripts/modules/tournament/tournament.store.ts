import { createStore } from "../../global/store";
import { createTournamentController } from "./tournament.controller";

export type Round = "Quarter" | "Semi" | "Final";

export type TournamentController = ReturnType<typeof createTournamentController>;

export type MatchState = {
    gameId: number;
    players: [string, string];
    winner: string | null;
    score?: [number, number];
};

export type TournamentState = {
    tournamentId: number;
    round?: Round;
    matches: MatchState[][] | null;
    current_match: MatchState | null;
    activePlayers: string[] | null;
    controller: TournamentController | null;
};

export const defaultTournamentState: TournamentState = {
    tournamentId: 0,
    matches: [],
    current_match: null,
    activePlayers: [],
    controller: null,
};

export const tournamentStore = createStore<TournamentState>(defaultTournamentState);
