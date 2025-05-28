import { Result, err, ok } from "neverthrow";
import { createTable } from "../../ui/components/Table";
import { createEl } from "../../utils/dom-helper";
import { MatchState, Round } from "./tournament.store";

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
        matches.push({ gameId: generateUniqueId(), players: [player1, player2], winner: null });
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

export const generateUniqueId = (): number => {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
};

export const findMatchById = (matches: MatchState[][], id: number): MatchState | null => {
    for (const round of matches) {
        for (const match of round) {
            if (match.gameId === id) return match;
        }
    }
    return null;
};

export const generateResultTable = (data: Array<any>): UIComponent => {
    const headers = ["Player1", "Player2", "Score"];
    const columns = ["player1", "player2", "score"];

    // Transform data to match the columns
    const transformedData = data.map((item) => ({
        player1: item._playerName1,
        player2: item._playerName2,
        score: `${item._playerScore1} - ${item._playerScore2}`, // Optional: format as a score string
    }));

    const table = createTable(headers, columns, transformedData);

    const tableWrapper = createEl(
        "div",
        `max-h-64 overflow-y-auto overflow-x-auto flex justify-center ${CONST.STYLES.CONTAINER}`
    );
    tableWrapper.appendChild(table);

    return [tableWrapper];
};
