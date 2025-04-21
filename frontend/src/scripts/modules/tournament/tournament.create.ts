import { tournamentStore } from "./tournament.store";
import { generateMatchList } from "./tournament.utils";

export const tournamentStart = (registeredPlayers: HTMLInputElement[]) => {
    const players = registeredPlayers.map((p) => p.value.trim());
    const matches = generateMatchList(registeredPlayers);
    const current_match = matches[0];
    const round = matches.length === 2 ? "Semi" : "Quarter";

    tournamentStore.set({
        round,
        matches,
        current_match,
        players,
        winner: null,
    });
};
