import { showPageElements } from "../../modules/layout/layout.service";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { connectBlockchain } from "../../modules/tournament/tournament.ui";
import {
    restartTournamentButton,
    winnerVisualization,
} from "../../modules/tournament/tournament.ui";
import { appendChildren, createEl } from "../../utils/dom-helper";

export const createTournamentPage = async (): Promise<HTMLElement[]> => {
    const { controller, round, tournamentId } = tournamentStore.get();
    const pageContainer = createEl("div", "p-6 flex flex-col items-center gap-8");

    showPageElements();

    // Header Section
    const headerSection = createEl("div", "w-full text-center");
    const title = createEl("h1", "text-4xl font-bold mb-2", {
        text: "🏆 Tournament Bracket",
    });
    const tournamentIdEl = createEl("p", "text-lg text-gray-600", {
        text: `Tournament ID: ${tournamentId || "Unknown"}`,
    });
    appendChildren(headerSection, [title, tournamentIdEl]);

    // Error Handling
    if (!controller) {
        const errorEl = createEl("p", "text-lg text-red-600 font-semibold", {
            text: "Unable to launch the tournament. Please try again later.",
        });
        appendChildren(pageContainer, [headerSection, errorEl]);
        return [pageContainer];
    }

    // Bracket Section
    const tree = controller.getTournamentTree();
    const bracketSection = createEl("section", "w-full");
    if (!tree) {
        const fallback = createEl("p", "text-center text-gray-500", {
            text: "Tournament tree could not be loaded.",
        });
        bracketSection.appendChild(fallback);
    } else {
        bracketSection.appendChild(tree);
    }

    // Winner Section
    const winnerSection = createEl("section", "w-full flex flex-col items-center gap-4");
    if (round === "Final") {
        const winner = controller.getFinalWinner();
        if (winner) {
            const winnerEl = winnerVisualization(winner);
            const blockchainControls = await connectBlockchain();
            appendChildren(winnerSection, [winnerEl, blockchainControls]);
        }
    }

    // Controls Section
    const controlSection = createEl("section", "w-full flex justify-center");
    controlSection.appendChild(restartTournamentButton());

    appendChildren(pageContainer, [controlSection, headerSection, bracketSection, winnerSection]);

    return [pageContainer];
};
