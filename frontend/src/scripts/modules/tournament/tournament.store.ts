import { createStore } from "../../global/store";
import { createTournamentController } from "./tournament.controller";

export type Round = "Quarter" | "Semi" | "Final" | "Default" | "End";

export type TournamentController = ReturnType<typeof createTournamentController>;

export type MatchState = {
    players: [string, string];
    winner: string | null;
    score?: [number, number];
};

export type TournamentState = {
    round: Round;
    matches: MatchState[][] | null;
    current_match: MatchState | null;
    activePlayers: string[] | null;
    controller: TournamentController | null;
};

export const defaultTournamentState: TournamentState = {
    round: "Default",
    matches: [],
    current_match: null,
    activePlayers: [],
    controller: null,
};

export const tournamentStore = createStore<TournamentState>(defaultTournamentState);
