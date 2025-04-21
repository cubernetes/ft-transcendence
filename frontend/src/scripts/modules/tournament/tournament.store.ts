import { createStore } from "../../global/store";

type TournamentState = {
    round: "Quarter" | "Semi" | "Final" | null;
    matches: string[][] | null;
    current_match: string[] | null;
    players: string[] | null;
    winner: string | null;
};

export const defaultTournamentState: TournamentState = {
    round: null,
    matches: null,
    current_match: null,
    players: null,
    winner: null,
};

export const tournamentStore = createStore<TournamentState>(defaultTournamentState);
