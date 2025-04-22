import { createPublicClient, createWalletClient, custom, http } from "viem";
import { holesky } from "viem/chains";

export const setupWallet = async () => {
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

    return { publicClient, walletClient };
};

export const connectWallet = async (walletClient: any): Promise<`0x${string}` | undefined> => {
    if (!walletClient) {
        window.log.info("No wallet detected! Please install MetaMask or another web3 wallet.");
        return undefined;
    }
    try {
        const [address] = await walletClient.requestAddresses();
        if (address) {
            // setAccount(address);
            window.log.info("Connected account:", address);
            return address;
        }
    } catch (error) {
        window.log.info(error);
    }
    return undefined;
};
