import { MatchState, Round } from "./tournament.store";
import { Result, err, ok } from "neverthrow";

export const generateRoundMatches = (players: string[]): MatchState[] => {
    if (!players || players.length < 2) {
        log.error("Not enough players to generate matches.");
        return [];
    }

    const playerPool = [...players];
    const matches: MatchState[] = [];

    while (playerPool.length > 1) {
        const player1 = playerPool.splice(Math.floor(Math.random() * playerPool.length), 1)[0];
        const player2 = playerPool.splice(Math.floor(Math.random() * playerPool.length), 1)[0];
        matches.push({ players: [player1, player2], winner: null });
    }

    return matches;
};

export const determineRound = (matches: MatchState[]): Result<Round, Error> => {
    const matchCount = matches.length;
    if (matchCount === 1) return ok("Final");
    else if (matchCount === 2) return ok("Semi");
    else if (matchCount > 2) return ok("Quarter");
    else return err(new Error("Failed to determine round"));
};

export const roundCompleted = (matches: MatchState[][] | null): boolean => {
    if (!matches || matches.length === 0) {
        return false;
    }

    const currentRoundMatches = matches[matches.length - 1];

    if (!currentRoundMatches || currentRoundMatches.length === 0) {
        return false;
    }

    return currentRoundMatches.every((match) => match.winner !== null);
};

export const generateUniqueTournamentId = (): number => {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
};
