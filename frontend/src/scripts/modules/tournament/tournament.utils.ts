import { MatchState, Round } from "./tournament.store";

export const generateRoundMatches = (players: string[]): MatchState[] => {
    if (!players || players.length < 2) {
        window.log.error("Not enough players to generate matches.");
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

export const determineRound = (matches: MatchState[]): Round => {
    const matchCount = matches.length;
    window.log.debug("What is the length: ", matchCount);
    if (matchCount === 1) {
        return "Final";
    } else if (matchCount === 2) {
        return "Semi";
    } else if (matchCount > 2) {
        return "Quarter";
    }
    return null;
};

export const roundCompleted = (matches: MatchState[][] | null): boolean => {
    if (!matches || matches.length === 0) {
        return false;
    }

    // Get the matches for the current round (last added)
    const currentRoundMatches = matches[matches.length - 1];

    window.log.debug("Current Round Matches: ", currentRoundMatches);

    if (!currentRoundMatches || currentRoundMatches.length === 0) {
        return false;
    }

    // A round is completed if every match has a winner
    return currentRoundMatches.every((match) => match.winner !== null);
};

export const generateUniqueTournamentId = (): number => {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
};
