import { Result, err, ok } from "neverthrow";
import {
    PublicClient,
    WalletClient,
    createPublicClient,
    createWalletClient,
    custom,
    http,
} from "viem";
import { avalancheFuji, holesky } from "viem/chains";
import { MatchState } from "../tournament.store";
import { CONTRACT_ABI } from "./contracts.abi";

export const readLocalContract = async (
    publicClient: PublicClient,
    functionName: string,
    args: any[]
) => {
    return publicClient.readContract({
        address: `0x${CONST.FUJI_ADDRESS}`,
        abi: CONTRACT_ABI,
        functionName,
        args,
    });
};

export const writeLocalContract = async (
    publicClient: PublicClient,
    walletClient: WalletClient,
    functionName: string,
    account: `0x${string}`,
    gameId: bigint,
    results: MatchState[][] | null
) => {
    if (!results || results.length === 0) {
        return err(new Error("Results are empty"));
    }
    const flatResults = results.flat();

    const gameResults = flatResults.map(({ players, score }) => ({
        _playerName1: players[0],
        _playerName2: players[1],
        _playerScore1: BigInt(score?.[0] ?? 0),
        _playerScore2: BigInt(score?.[1] ?? 0),
    }));

    const { request } = await publicClient.simulateContract({
        address: `0x${CONST.FUJI_ADDRESS}`,
        abi: CONTRACT_ABI,
        functionName,
        args: [gameId, gameResults],
        account,
    });

    return walletClient.writeContract(request);
};

export const setupWallet = async () => {
    //Get Clients
    const publicClient = createPublicClient({
        chain: avalancheFuji,
        transport: http(),
    });

    const walletClient = (() => {
        try {
            if (!window.ethereum) {
                return null;
            }
            return createWalletClient({
                chain: avalancheFuji,
                transport: custom(window.ethereum),
            });
        } catch (error) {
            log.error("Failed to initialize wallet client:", error);
            return null;
        }
    })();

    return { publicClient, walletClient };
};

export const connectWallet = async (walletClient: any): Promise<`0x${string}` | undefined> => {
    if (!walletClient) {
        log.info("No wallet detected! Please install MetaMask or another web3 wallet.");
        return undefined;
    }
    try {
        const [address] = await walletClient.requestAddresses();
        if (address) {
            // setAccount(address);
            log.info("Connected account:", address);
            return address;
        }
    } catch (error) {
        log.info(error);
    }
    return undefined;
};
