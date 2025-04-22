export type Round = "Quarter" | "Semi" | "Final" | "Waiting";

export type MatchResult = {
    players: [string, string];
    winner: string | null;
    score?: [number, number];
    round: Round;
};

export type TournamentState = {
    round: Round;
    matches: string[][] | null;
    current_match: string[] | null;
    players: string[] | null;
    results: MatchResult[];
};
