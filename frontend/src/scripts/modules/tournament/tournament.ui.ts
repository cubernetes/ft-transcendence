import { Result, err, ok } from "neverthrow";
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
    const {
        WALLET_CONNECT_ERROR,
        WALLET_CONNECT,
        GET_TOURNAMENT,
        RECORD_TOURNAMENT,
        GET_TOURNAMENT_ERROR,
    } = CONST.TEXT;
    const setupResult = await setupWallet();

    if (setupResult.isErr()) {
        return createEl("div", "text-red-500 font-semibold text-center", {
            text: WALLET_CONNECT_ERROR,
            i18nVars: { icon: "❌" },
        });
    }

    const { publicClient, walletClient } = setupResult.value;
    let account: Result<`0x${string}`, Error> = err(new Error("Not connected yet"));

    const connectButton = createButton({
        text: WALLET_CONNECT,
        i18nVars: { icon: "🔌" },
        tw: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50",
        click: async () => {
            account = await connectWallet(walletClient);
            if (account.isOk()) {
                connectButton.classList.add("hidden");
                readButton.classList.remove("hidden");
                writeButton.classList.remove("hidden");
            }
        },
    });

    const readButton = createButton({
        text: GET_TOURNAMENT,
        i18nVars: { icon: "📖" },
        tw: "bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-xl border transition hidden",
        click: async () => {
            const gameId = BigInt(tournamentStore.get().tournamentId || "0");
            const result = await readLocalContract(publicClient, "getAllGameIds", [gameId]);
            if (result.isErr()) {
                return createEl("p", "text-red-500 font-semibold text-center", {
                    text: GET_TOURNAMENT_ERROR,
                });
            }
            const tournamentData = result.value;
            log.info("Tournament data:", tournamentData);
        },
    });

    const writeButton = createButton({
        text: RECORD_TOURNAMENT,
        i18nVars: { icon: "📝" },
        tw: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition hidden",
        click: async () => {
            if (account.isErr() || !walletClient) {
                log.info("No account connected");
                return;
            }
            const address = account.value;
            const tournamentData = tournamentStore.get();
            const gameId = BigInt(tournamentStore.get().tournamentId || "0");
            try {
                const tx = await writeLocalContract(
                    publicClient,
                    walletClient,
                    "addTournamentHistory",
                    address,
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

    const restartButton = createButton({
        text: RESTART_TOURNAMENT,
        i18nVars: { icon: "🔁" },
        tw: "bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition",
        click: () => {
            controller!.resetTournament(); // Safe due to the disabled check below
            navigateTo("play");
        },
    });

    if (!controller) {
        restartButton.disabled = true;
        restartButton.title = "Controller not available";
        restartButton.classList.add("opacity-50", "cursor-not-allowed");
    }

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
