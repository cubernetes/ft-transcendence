import { showPageElements } from "../../modules/layout/layout.service";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { connectBlockchain } from "../../modules/tournament/tournament.ui";
import {
    restartTournamentButton,
    winnerVisualization,
} from "../../modules/tournament/tournament.ui";
import { appendChildren, createEl } from "../../utils/dom-helper";

export const createTournamentPage = async (): Promise<HTMLElement[]> => {
    // showPageElements(); -> shouldn't have side effects
    const { controller, round, tournamentId } = tournamentStore.get();
    const pageContainer = createEl("div", "tournament-page-container");

    // TODO: Should never throw, return the error html el instead
    if (!controller) throw new Error("initialize_controller");

    const tournamentIdEl = createEl("div", "text-center text-2xl font-bold", {
        text: `Tournament ID: ${tournamentId}`,
    });
    pageContainer.appendChild(tournamentIdEl);

    const tree = controller.getTournamentTree();
    if (!tree) throw new Error("tournament_tree_not_found");

    if (round === "Final") {
        const winner = controller.getFinalWinner();
        if (winner)
            appendChildren(pageContainer, [await connectBlockchain(), winnerVisualization(winner)]);
    }

    appendChildren(pageContainer, [tree, restartTournamentButton()]);

    return [pageContainer];
};
