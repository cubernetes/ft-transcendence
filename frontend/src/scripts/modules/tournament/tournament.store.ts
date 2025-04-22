import { createStore } from "../../global/store";
import { TournamentState } from "./tournament.types";

export const defaultTournamentState: TournamentState = {
    round: "Waiting",
    matches: [],
    current_match: null,
    players: [],
    results: [],
};

export const tournamentStore = createStore<TournamentState>(defaultTournamentState);
