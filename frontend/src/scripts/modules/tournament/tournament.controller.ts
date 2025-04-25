import { updateTournamentTree } from "../../ui/layout/TournamentBracket";
import { TournamentState, tournamentStore } from "./tournament.store";
import { determineRound, generateRoundMatches } from "./tournament.utils";

export const createTournamentController = (allPlayers: string[], tree: HTMLElement) => {
    let unsubscribeTreeUpdate: () => void;

    const createNextRound = () => {
        const { activePlayers, matches } = tournamentStore.get();

        if (!activePlayers || activePlayers.length <= 1) {
            window.log.error("Not enough players available for the next round.");
            return;
        }

        const roundMatches = generateRoundMatches(activePlayers);
        const round = determineRound(roundMatches);

        // Safely create a new matches array
        const newMatches = [...(matches ?? []), roundMatches];

        const partialUpdate: Partial<TournamentState> = {
            round,
            matches: newMatches,
        };

        tournamentStore.update(partialUpdate);
        window.log.debug("Next Round created: ", tournamentStore.get());
    };

    const subscribeTournamentTree = () => {
        unsubscribeTreeUpdate = tournamentStore.subscribe(() => {
            updateTournamentTree(tree);
        });
    };

    const cleanup = () => {
        if (unsubscribeTreeUpdate) {
            unsubscribeTreeUpdate();
        }
    };

    const startTournament = () => {
        tournamentStore.set({
            round: "Default",
            matches: [],
            current_match: null,
            activePlayers: allPlayers,
            controller,
        });

        subscribeTournamentTree();
        createNextRound();
        updateTournamentTree(tree);
        window.log.debug("Tournament started");
    };

    const stopTournament = () => {
        resetTournament();
        cleanup();
    };

    const resetTournament = () => {
        tournamentStore.set({
            round: "Default",
            matches: [],
            current_match: null,
            activePlayers: [],
            controller: null,
        });
    };

    const getTournamentTree = () => {
        return tree;
    };

    const controller = {
        createNextRound,
        startTournament,
        stopTournament,
        resetTournament,
        getTournamentTree,
    };

    return controller;
};
