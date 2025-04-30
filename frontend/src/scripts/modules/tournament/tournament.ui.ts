import { navigateTo } from "../../global/router";
import {
    connectWallet,
    readLocalContract,
    setupWallet,
    writeLocalContract,
} from "../../modules/tournament/contracts/contract.interactions";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { createButton } from "../../ui/components/Button";
import { appendChildren, createEl } from "../../utils/dom-helper";

export const connectBlockchain = async (): Promise<HTMLElement> => {
    const { publicClient, walletClient } = await setupWallet();
    if (!publicClient || !walletClient) {
        window.log.error("Failed to initialize public or wallet client");
        return createEl("div", "text-red-500", { text: "Failed to initialize wallet client" });
    }

    let account: `0x${string}` | undefined;

    const connectButton = createButton("Connect Wallet", "mx-auto", async () => {
        account = await connectWallet(walletClient);
        if (account) {
            connectButton.style.display = "none";
            readButton.style.display = "block";
            writeButton.style.display = "block";
        }
    });

    const readButton = createButton("Get Tournament History", "", async () => {
        const gameId = BigInt(tournamentStore.get().tournamentId || "0");
        const result = await readLocalContract(publicClient, "getAllGameIds", [gameId]);
        window.log.info("Game Got:", result);
    });
    readButton.style.display = "none";

    const writeButton = createButton("Record Game", "", async () => {
        if (!account || !walletClient) {
            window.log.info("No account connected");
            return;
        }

        const tournamentData = tournamentStore.get();
        const gameId = BigInt(tournamentStore.get().tournamentId || "0");
        try {
            const tx = await writeLocalContract(
                publicClient,
                walletClient,
                "addTournamentHistory",
                account,
                gameId,
                tournamentData.matches
            );
            window.log.info("Transaction hash:", tx);
        } catch (err) {
            window.log.error("Failed to record game:", err);
        }
    });
    writeButton.style.display = "none";

    const container = createEl("div", "flex flex-col gap-4 items-center");
    appendChildren(container, [connectButton, readButton, writeButton]);

    return container;
};

export const restartTournamentButton = (): HTMLButtonElement => {
    const { controller } = tournamentStore.get();
    if (!controller) {
        throw new Error("initialize_controller");
    }
    const restartButton = createButton("Start another Tournament", "mx-auto", () => {
        controller.resetTournament();
        navigateTo("setup");
    });
    return restartButton;
};

export const winnerVisualization = (winnerName: string): HTMLElement => {
    const winnerContainer = createEl("div", "winner-container");
    const winnerText = createEl("h1", "text-4xl font-bold text-center", {
        text: `Winner: ${winnerName}`,
    });
    appendChildren(winnerContainer, [winnerText]);
    return winnerContainer;
};
