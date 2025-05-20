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
    const { WALLET_CONNECT_ERROR, WALLET_CONNECT, GET_TOURNAMENT, RECORD_TOURNAMENT } = CONST.TEXT;
    const { publicClient, walletClient } = await setupWallet();
    if (!publicClient || !walletClient) {
        log.error("Failed to initialize public or wallet client");
        return createEl("div", "text-red-500 font-semibold text-center", {
            text: WALLET_CONNECT_ERROR,
        });
    }

    let account: `0x${string}` | undefined;

    const connectButton = createButton({
        text: WALLET_CONNECT,
        tw: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50",
        click: async () => {
            account = await connectWallet(walletClient);
            if (account) {
                connectButton.classList.add("hidden");
                readButton.classList.remove("hidden");
                writeButton.classList.remove("hidden");
            }
        },
    });

    const readButton = createButton({
        text: GET_TOURNAMENT,
        tw: "bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-xl border transition hidden",
        click: async () => {
            const gameId = BigInt(tournamentStore.get().tournamentId || "0");
            const result = await readLocalContract(publicClient, "getAllGameIds", [gameId]);
            log.info("Game Got:", result);
        },
    });

    const writeButton = createButton({
        text: RECORD_TOURNAMENT,
        tw: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition hidden",
        click: async () => {
            if (!account || !walletClient) {
                log.info("No account connected");
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
                log.info("Transaction hash:", tx);
            } catch (err) {
                log.error("Failed to record game:", err);
            }
        },
    });

    const container = createEl("div", "flex flex-col gap-4 items-center mt-4");
    appendChildren(container, [connectButton, readButton, writeButton]);
    return container;
};

export const restartTournamentButton = (): HTMLButtonElement => {
    const { RESTART_TOURNAMENT } = CONST.TEXT;
    const { controller } = tournamentStore.get();
    if (!controller) {
        throw new Error("initialize_controller");
    }
    const restartButton = createButton({
        text: RESTART_TOURNAMENT,
        tw: "bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition",
        click: () => {
            controller.resetTournament();
            navigateTo("play");
        },
    });
    return restartButton;
};

export const winnerVisualization = (winnerName: string): HTMLElement => {
    const winnerContainer = createEl("div", "flex flex-col items-center gap-2 mt-6");

    const winnerText = createEl("h1", "text-4xl font-bold text-center text-green-700", {
        text: `🥇 Winner: ${winnerName}`,
    });

    appendChildren(winnerContainer, [winnerText]);
    return winnerContainer;
};
