import { createPublicClient, createWalletClient, custom, http } from "viem";
import { holesky } from "viem/chains";
import { CONTRACT_ABI } from "../../contracts/contracts.abi.js";
import { CONTRACT_ADDRESS, CONTRACT_NAME } from "../../contracts/contracts.constants.js";

export const connectBlockchain = async (): Promise<HTMLButtonElement | HTMLElement> => {
    const connectButton = document.createElement("button");
    connectButton.textContent = "Connect Wallet";
    connectButton.className = "mx-auto";

    const readButton = document.createElement("button");
    readButton.textContent = "Get Game";
    readButton.style.display = "none";

    const writeButton = document.createElement("button");
    writeButton.textContent = "Record Game";
    writeButton.style.display = "none";

    //Get Clients
    const publicClient = createPublicClient({
        chain: holesky,
        transport: http(),
    });

    const walletClient = (() => {
        try {
            if (!window.ethereum) {
                return null;
            }
            return createWalletClient({
                chain: holesky,
                transport: custom(window.ethereum),
            });
        } catch (error) {
            window.log.error("Failed to initialize wallet client:", error);
            return null;
        }
    })();

    // State management
    let account: `0x${string}` | undefined;
    const setAccount = (newAccount: `0x${string}` | undefined) => {
        account = newAccount;
    };

    const connectWallet = async (): Promise<`0x${string}` | undefined> => {
        if (!walletClient) {
            window.log.info("No wallet detected! Please install MetaMask or another web3 wallet.");
            return undefined;
        }
        try {
            const [address] = await walletClient.requestAddresses();
            if (address) {
                setAccount(address);
                window.log.info("Connected account:", address);
                return address;
            }
        } catch (error) {
            window.log.info(error);
        }
        return undefined;
    };

    // Contract interactions
    const inputRead = document.createElement("input");
    inputRead.type = "text";
    inputRead.id = "value";
    inputRead.placeholder = "Get GameID";
    inputRead.className = "mx-2";
    inputRead.style.display = "none";

    readButton.addEventListener("click", async () => {
        const gameId = BigInt(inputRead.value || "0");
        const gameResult = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getGame",
            args: [gameId],
        });
        window.log.info("Game Got:", gameResult);
    });

    // Contract interactions
    const inputWrite = document.createElement("input");
    inputWrite.type = "text";
    inputWrite.id = "value";
    inputWrite.placeholder = "Write GameId";
    inputWrite.className = "mx-2";
    inputWrite.style.display = "none";

    writeButton.addEventListener("click", async () => {
        const gameId = BigInt(inputWrite.value || "0");
        if (!account || !walletClient) {
            window.log.info("No account connected");
            return;
        }
        const gameResult = {
            _playerId1: 1n,
            _playerId2: 2n,
            _playerScore1: 25n,
            _playerScore2: 24n,
        };
        const { request } = await publicClient.simulateContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "addGame",
            args: [gameId, gameResult],
            account,
        });
        const hash = await walletClient.writeContract(request);
        window.log.info("Transaction hash:", hash);
    });

    connectButton.addEventListener("click", async () => {
        const connectedAccount = await connectWallet();
        if (connectedAccount) {
            connectButton.style.display = "none";
            readButton.style.display = "block";
            writeButton.style.display = "block";
            inputWrite.style.display = "block";
            inputRead.style.display = "block";
        }
    });

    // Return Values
    const container = document.createElement("div");
    container.appendChild(connectButton);
    container.appendChild(inputRead);
    container.appendChild(readButton);
    container.appendChild(inputWrite);
    container.appendChild(writeButton);
    return container;
};
