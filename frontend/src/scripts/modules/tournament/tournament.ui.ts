import {
    readLocalContract,
    writeLocalContract,
} from "../../modules/tournament/contracts/contract.interactions";
import { connectWallet, setupWallet } from "../../modules/tournament/contracts/contracts.utils";
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
            inputWrite.style.display = "block";
            inputRead.style.display = "block";
        }
    });

    const inputRead = createEl("input", "mx-2", {
        props: { type: "text", placeholder: "Get GameID" },
        attributes: { id: "value" },
        style: { display: "none" },
    });

    const inputWrite = createEl("input", "mx-2", {
        props: { type: "text", placeholder: "Write GameId" },
        attributes: { id: "value", display: "none" },
        style: { display: "none" },
    });

    const readButton = createButton("Get Tournament History", "", async () => {
        const gameId = BigInt(inputRead.value || "0");
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
        const gameId = BigInt(inputWrite.value || "0");
        try {
            const tx = await writeLocalContract(
                publicClient,
                walletClient,
                "addTournamentHistory",
                account,
                gameId,
                tournamentData.results
            );
            window.log.info("Transaction hash:", tx);
        } catch (err) {
            window.log.error("Failed to record game:", err);
        }
    });
    writeButton.style.display = "none";

    const container = createEl("div", "flex flex-col gap-4 items-center");
    appendChildren(container, [connectButton, inputRead, readButton, inputWrite, writeButton]);

    return container;
};
