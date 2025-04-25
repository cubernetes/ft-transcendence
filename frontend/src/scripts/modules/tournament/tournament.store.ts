import { createStore } from "../../global/store";
import { TournamentState } from "./tournament.types";

export const defaultTournamentState: TournamentState = {
    round: "Default",
    matches: [],
    current_match: null,
    players: [],
    controller: null,
};

export const tournamentStore = createStore<TournamentState>(defaultTournamentState);
