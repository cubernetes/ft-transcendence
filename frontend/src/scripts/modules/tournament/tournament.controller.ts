import { PongState, defaultGameConfig } from "@darrenkuro/pong-core";
import { buildTournamentTree } from "../../ui/layout/TournamentBracket";
import { gameStore } from "../game/game.store";
import { TournamentState, tournamentStore } from "./tournament.store";
import {
    determineRound,
    generateRoundMatches,
    generateUniqueTournamentId,
    roundCompleted,
} from "./tournament.utils";

export const createTournamentController = (allPlayers: string[]) => {
    const createNextRound = () => {
        const { activePlayers, matches } = tournamentStore.get();

        if (!activePlayers || activePlayers.length <= 1) {
            log.error("Not enough players available for the next round.");
            return;
        }

        const roundMatches = generateRoundMatches(activePlayers);
        const nextRound = determineRound(roundMatches);
        const newMatches = [...(matches ?? []), roundMatches];

        const partialUpdate: Partial<TournamentState> = {
            round: nextRound,
            matches: newMatches,
            activePlayers: [],
        };

        tournamentStore.update(partialUpdate);
    };

    const startTournament = () => {
        tournamentStore.update({
            tournamentId: generateUniqueTournamentId(),
            activePlayers: allPlayers,
        });
        createNextRound();
    };

    const getFinalWinner = (): string | null => {
        const { matches, round } = tournamentStore.get();

        if (!Array.isArray(matches) || matches.length === 0) {
            log.warn("No matches found in tournament store.");
            return null;
        }

        if (round !== "Final") return null;

        const lastRound = matches[matches.length - 1];
        const finalMatch = lastRound?.[0];

        return finalMatch?.winner ?? null;
    };

    const startMatch = (gameId: number) => {
        const { controller } = gameStore.get();
        if (!controller) {
            throw new Error("initialize_controller");
        }
        const { matches } = tournamentStore.get();
        if (!matches || matches.length === 0) {
            log.error("No matches found in tournament store.");
            return;
        }
        const playerNames = matches[matches.length - 1][gameId].players;
        if (!playerNames || playerNames.length < 2) {
            log.error("Not enough players for the match.");
            return;
        }
        gameStore.update({ playerNames });
        controller.startGame("tournament", {
            ...defaultGameConfig,
            playTo: 3,
        });
    };

    const handleEndTournamentMatch = async (winnerName: string, finalState: PongState) => {
        const { matches, activePlayers, round } = tournamentStore.get();
        if (!matches || matches.length === 0) {
            log.error("No matches found in tournament store.");
            return;
        }

        const currentRoundMatches = matches[matches.length - 1];

        const matchToUpdate = currentRoundMatches.find(
            (match) => match.players.includes(winnerName) && match.winner === null
        );

        if (!matchToUpdate) {
            log.error("Match not found for winner:", winnerName);
            return;
        }

        matchToUpdate.winner = winnerName;
        matchToUpdate.score = finalState.scores;

        tournamentStore.update({
            matches: [...matches],
            activePlayers: [...(activePlayers ?? []), winnerName],
        });

        if (roundCompleted(matches) && round !== "Final") {
            createNextRound();
        }
    };

    const resetTournament = () => {
        tournamentStore.set({
            tournamentId: tournamentStore.get().tournamentId,
            round: null,
            matches: [],
            current_match: null,
            activePlayers: [],
            controller: null,
        });
    };

    const getTournamentTree = () => {
        const { matches, round } = tournamentStore.get();
        if (!matches) throw new Error("No matches found in tournament store.");
        return buildTournamentTree(matches, round);
    };

    const controller = {
        startMatch,
        handleEndTournamentMatch,
        createNextRound,
        startTournament,
        resetTournament,
        getTournamentTree,
        getFinalWinner,
    };

    return controller;
};
