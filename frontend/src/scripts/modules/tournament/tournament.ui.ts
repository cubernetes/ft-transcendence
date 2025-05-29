import { Result, err, ok } from "neverthrow";
import { avalancheFuji, holesky } from "viem/chains";
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
import { replaceChildren } from "../../utils/dom-helper";
import { generateResultTable } from "./tournament.utils";

export const connectBlockchain = async (visualizer: UIContainer): Promise<HTMLElement> => {
    const {
        WALLET_CONNECT_ERROR,
        WALLET_CONNECT,
        GET_TOURNAMENT,
        RECORD_TOURNAMENT,
        GET_TOURNAMENT_ERROR,
        CHAIN_ID_ERROR,
    } = CONST.TEXT;
    const setupResult = await setupWallet();

    if (setupResult.isErr()) {
        return createEl("div", "text-red-500 font-semibold text-center mt-4", {
            text: WALLET_CONNECT_ERROR,
            i18nVars: { icon: "❌" },
        });
    }

    const { publicClient, walletClient } = setupResult.value;
    let account: Result<`0x${string}`, Error> = err(new Error("Not connected yet"));

    const chainId = await walletClient.getChainId();
    if (chainId !== avalancheFuji.id) {
        return createEl("div", "text-red-500 font-semibold text-center mt-4", {
            text: CHAIN_ID_ERROR,
        });
    }

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
            replaceChildren(visualizer, generateResultTable(tournamentData));
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
                if (tx.isOk()) {
                    const txHash = tx.value;
                    const shortened = `${txHash.slice(0, 10)}...${txHash.slice(-5)}`;
                    const explorerLink = `https://subnets-test.avax.network/c-chain/tx/${txHash}`;
                    replaceChildren(visualizer, [
                        createEl("a", `${CONST.FONT.BODY_XS} text-blue-600 underline`, {
                            text: `TX: ${shortened}`,
                            attributes: {
                                href: explorerLink,
                                target: "_blank",
                                rel: "noopener noreferrer",
                            },
                        }),
                    ]);
                }
            } catch (err) {
                replaceChildren(visualizer, [
                    createEl("a", "text-red-500 font-semibold text-center", {
                        text: "Failed to record game. Please try again.",
                    }),
                ]);
            }
        },
    });

    const container = createEl(
        "div",
        `${CONST.FONT.BODY_SM} flex flex-col gap-4 items-center mt-4`
    );
    appendChildren(container, [connectButton, readButton, writeButton]);
    return container;
};

export const restartTournamentButton = (): HTMLButtonElement => {
    const { controller } = tournamentStore.get();

    const restartButton = createButton({
        text: "🔁",
        tw: `${CONST.FONT.BODY_XS} bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition`,
        click: () => {
            controller!.resetTournament(); // Safe due to the disabled check below
            navigateTo(CONST.ROUTE.PLAY);
        },
    });

    if (!controller) {
        restartButton.disabled = true;
    }

    return restartButton;
};

export const winnerVisualization = (winnerName: string): HTMLElement => {
    const { WINNER_NAME } = CONST.TEXT;
    const winnerContainer = createEl("div", "flex flex-col items-center gap-2 mt-6");

    const winnerText = createEl("h1", `${CONST.FONT.H5} font-bold text-center text-green-700`, {
        text: WINNER_NAME,
        i18nVars: { icon: "🥇", name: winnerName },
    });

    appendChildren(winnerContainer, [winnerText]);
    return winnerContainer;
};
