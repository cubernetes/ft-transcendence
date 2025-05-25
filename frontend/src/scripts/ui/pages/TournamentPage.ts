import { showPageElements } from "../../modules/layout/layout.service";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { connectBlockchain } from "../../modules/tournament/tournament.ui";
import {
    restartTournamentButton,
    winnerVisualization,
} from "../../modules/tournament/tournament.ui";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createHeading } from "../components/Heading";
import { createParagraph } from "../components/Paragraph";
import { createStatus } from "../components/Status";

export const createTournamentPage = async (): Promise<UIComponent> => {
    const { controller, round, tournamentId } = tournamentStore.get();
    const { statusEl, showErr } = createStatus();
    const pageContainer = createEl("div", "w-full h-full p-6 flex flex-col items-center gap-8");

    showPageElements();

    // Header Section
    const headerSection = createEl("div", "w-full text-center");

    const title = createHeading({ text: "🏆 Tournament Bracket", tw: "font-bold" });
    const tournamentIdEl = createParagraph({
        text: `Tournament ID: ${tournamentId || "Unknown"}`,
        tw: "text-gray-600",
    });

    appendChildren(headerSection, [title, tournamentIdEl]);

    // Error Handling
    if (!controller) {
        showErr("Unable to launch the tournament. Please try again later.");
        return [statusEl];
    }

    // Bracket Section
    const tree = controller.getTournamentTree();
    const bracketSection = createEl("section", "w-full flex justify-center");
    if (!tree) {
        const fallback = createParagraph({
            text: "Tournament tree could not be loaded.",
            tw: "text-center text-gray-500",
        });
        bracketSection.appendChild(fallback);
    } else {
        bracketSection.appendChild(tree);
    }

    // Winner Section
    const winnerSection = createEl("section", "w-full flex flex-col items-center");
    if (round === "Final") {
        const winner = controller.getFinalWinner();
        if (winner) {
            const winnerEl = winnerVisualization(winner);
            const blockchainControls = await connectBlockchain();
            appendChildren(winnerSection, [winnerEl, blockchainControls]);
        }
    }

    // Controls Section
    // const controlSection = createEl("section", "w-full flex justify-center");
    // controlSection.appendChild(restartTournamentButton());

    appendChildren(pageContainer, [headerSection, bracketSection, winnerSection]);

    return createArcadeWrapper([pageContainer]);
};
