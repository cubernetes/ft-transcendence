import { showPageElements } from "../../modules/layout/layout.service";
import { stopTournament } from "../../modules/tournament/tournament.create";
import { connectBlockchain } from "../../modules/tournament/tournament.ui";
import { appendChildren, createEl } from "../../utils/dom-helper";

export const createTournamentPage = async (): Promise<HTMLElement[]> => {
    showPageElements();
    stopTournament();
    const blockchainSection = await connectBlockchain();
    const main = createEl("main", "container mx-auto p-4", { children: [blockchainSection] });

    main.appendChild(blockchainSection);

    return [main];
};
