import { tournamentStore } from "../../modules/tournament/tournament.store";
import { connectBlockchain } from "../../modules/tournament/tournament.ui";
import { createEl } from "../../utils/dom-helper";

export const createTournamentPage = async (): Promise<HTMLElement[]> => {
    const { controller } = tournamentStore.get();
    const pageContainer = createEl("div", "tournament-page-container");

    if (!controller) {
        window.log.error("Tournament controller not initialized.");
        return [];
    }

    const tree = controller?.getTournamentTree();
    if (tree) {
        pageContainer.appendChild(tree); // Add the tournament tree to the page
    } else {
        window.log.error("Tournament tree not available.");
        return [];
    }
    const blockchainSection = await connectBlockchain();
    pageContainer.appendChild(blockchainSection);
    return [pageContainer];
};
