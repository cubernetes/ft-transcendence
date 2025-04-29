import { defaultGameConfig } from "@pong-core";
import { PongState } from "@pong-core";
import { buildTournamentTree } from "../../ui/layout/TournamentBracket";
import { gameStore } from "../game/game.store";
import { Round, TournamentState, tournamentStore } from "./tournament.store";
import {
    determineRound,
    generateRoundMatches,
    generateUniqueTournamentId,
    roundCompleted,
} from "./tournament.utils";

export const createTournamentController = (allPlayers: string[]) => {
    // let unsubscribeTreeUpdate: () => void;

    const createNextRound = () => {
        const { activePlayers, matches } = tournamentStore.get();

        if (!activePlayers || activePlayers.length <= 1) {
            window.log.error("Not enough players available for the next round.");
            return;
        }

        const roundMatches = generateRoundMatches(activePlayers);
        const nextRound = determineRound(roundMatches);
        window.log.debug("Next round determined: ", nextRound);

        // Safely create a new matches array
        const newMatches = [...(matches ?? []), roundMatches];

        const partialUpdate: Partial<TournamentState> = {
            round: nextRound,
            matches: newMatches,
            activePlayers: [],
        };

        tournamentStore.update(partialUpdate);
        window.log.debug("Next Round created: ", tournamentStore.get());
    };

    const startTournament = () => {
        tournamentStore.update({
            tournamentId: generateUniqueTournamentId(),
            activePlayers: allPlayers,
            controller: controller,
        });

        // subscribeTournamentTree();
        createNextRound();
        window.log.debug("Tournament started");
    };

    const getFinalWinner = (): string | null => {
        const { matches, round } = tournamentStore.get();

        if (!Array.isArray(matches) || matches.length === 0) {
            window.log.warn("No matches found in tournament store.");
            return null;
        }

        if (round !== "Final") return null;

        const lastRound = matches[matches.length - 1];
        const finalMatch = lastRound?.[0];

        return finalMatch?.winner ?? null;
    };

    const startMatch = () => {
        const { controller } = gameStore.get();
        if (!controller) {
            throw new Error("initialize_controller");
        }
        window.log.debug("Starting match in tournament");
        controller.startGame("tournament", {
            ...defaultGameConfig,
            playTo: 3,
        });
    };

    const handleEndMatch = async (winnerName: string, finalState: PongState) => {
        const { matches, activePlayers, round } = tournamentStore.get();
        if (!matches || matches.length === 0) {
            window.log.error("No matches found in tournament store.");
            return;
        }

        const currentRoundMatches = matches[matches.length - 1];

        // Find the match where winnerName is one of the two players and winner is still null
        const matchToUpdate = currentRoundMatches.find(
            (match) => match.players.includes(winnerName) && match.winner === null
        );

        if (!matchToUpdate) {
            window.log.error("Match not found for winner:", winnerName);
            return;
        }

        // Update match
        matchToUpdate.winner = winnerName;
        matchToUpdate.score = finalState.scores;

        // Update the store (force store to update)
        tournamentStore.update({
            matches: [...matches],
            activePlayers: [...(activePlayers ?? []), winnerName],
        });

        // Check if entire round is now completed
        if (roundCompleted(matches) && round !== "Final") {
            window.log.debug("Round completed, creating next round.");
            createNextRound();
        }
    };

    const stopTournament = () => {
        resetTournament();
        // cleanup();
    };

    const resetTournament = () => {
        tournamentStore.set({
            tournamentId: tournamentStore.get().tournamentId,
            round: "Default",
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
        handleEndMatch,
        createNextRound,
        startTournament,
        stopTournament,
        resetTournament,
        getTournamentTree,
        getFinalWinner,
    };

    return controller;
};
