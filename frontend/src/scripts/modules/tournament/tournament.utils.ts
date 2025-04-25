import { tournamentStore } from "./tournament.store";
import { MatchState, Round } from "./tournament.types";

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
    if (matches.length === 1) {
        return "Final";
    } else if (matches.length === 2) {
        return "Semi";
    } else if (matches.length > 2) {
        return "Quarter";
    }
    return "Default";
};
