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
): Promise<Result<any, Error>> => {
    try {
        const data = await publicClient.readContract({
            address: `0x${CONST.ADDRESS.FUJI}`,
            abi: CONTRACT_ABI,
            functionName,
            args,
        });
        return ok(data);
    } catch (error) {
        return err(new Error(`Failed to read contract: ${(error as Error).message}`));
    }
};

export const writeLocalContract = async (
    publicClient: PublicClient,
    walletClient: WalletClient,
    functionName: string,
    account: `0x${string}`,
    gameId: bigint,
    results: MatchState[][] | null
): Promise<Result<`0x${string}`, Error>> => {
    if (!results || results.length === 0) {
        return err(new Error("Results are empty"));
    }

    try {
        const flatResults = results.flat();
        const gameResults = flatResults.map(({ players, score }) => ({
            _playerName1: players[0],
            _playerName2: players[1],
            _playerScore1: BigInt(score?.[0] ?? 0),
            _playerScore2: BigInt(score?.[1] ?? 0),
        }));

        const { request } = await publicClient.simulateContract({
            address: `0x${CONST.ADDRESS.FUJI}`,
            abi: CONTRACT_ABI,
            functionName,
            args: [gameId, gameResults],
            account,
        });

        const txHash = await walletClient.writeContract(request);
        return ok(txHash);
    } catch (error) {
        return err(new Error(`Failed to write to contract: ${(error as Error).message}`));
    }
};

export const setupWallet = async (): Promise<
    Result<{ publicClient: PublicClient; walletClient: WalletClient }, Error>
> => {
    try {
        const publicClient = createPublicClient({
            chain: avalancheFuji,
            transport: http(),
        });

        if (!window.ethereum) {
            return err(
                new Error(
                    "No Ethereum provider found. Please install MetaMask or a compatible wallet."
                )
            );
        }

        const walletClient = createWalletClient({
            chain: avalancheFuji,
            transport: custom(window.ethereum),
        });

        return ok({ publicClient, walletClient });
    } catch (error) {
        return err(new Error(`Failed to setup wallet: ${(error as Error).message}`));
    }
};

export const connectWallet = async (walletClient: any): Promise<Result<`0x${string}`, Error>> => {
    if (!walletClient)
        return err(
            new Error("No wallet detected! Please install MetaMask or another web3 wallet.")
        );
    try {
        const [address] = await walletClient.requestAddresses();
        if (address) {
            return ok(address);
        }
    } catch (error) {
        return err(new Error(error as string));
    }
    return err(new Error("Failed to connect wallet"));
};
