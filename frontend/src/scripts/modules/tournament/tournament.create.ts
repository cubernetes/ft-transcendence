import { tournamentStore } from "./tournament.store";
import { MatchResult } from "./tournament.types";
import { generateMatchList } from "./tournament.utils";

export const setupTournament = (registeredPlayers: HTMLInputElement[]) => {
    const players = registeredPlayers.map((p) => p.value.trim());
    const matches = generateMatchList(registeredPlayers);
    const current_match = matches[0];
    const round = matches.length === 2 ? "Semi" : "Quarter";
    const results: MatchResult[] = [];

    tournamentStore.set({
        round,
        matches,
        current_match,
        players,
        results,
    });

    window.log.debug("Tournament Store set", tournamentStore);
};

export const stopTournament = () => {
    tournamentStore.update({
        results: [
            {
                players: ["Bob", "Anna"],
                winner: "Bob",
                score: [5, 3],
                round: "Final",
            },
            {
                players: ["JK", "Fe"],
                winner: "Fe",
                score: [102, 12],
                round: "Quarter",
            },
            {
                players: ["Y", "Ywq"],
                winner: "Ywq",
                score: [12, 23],
                round: "Semi",
            },
            {
                players: ["teeee", "Anssna"],
                winner: "teeee",
                score: [223, 2323],
                round: "Quarter",
            },
        ],
    });
    const tournamentState = tournamentStore.get();
    window.log.debug("Tournament Store updated", tournamentState);
    window.log.debug("Tournament Store updated", tournamentState.results);
};
