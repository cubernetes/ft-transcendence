import { Result, err, ok } from "neverthrow";
import { MatchState } from "../tournament.types";
import { CONTRACT_ABI } from "./contracts.abi";
import { CONTRACT_ADDRESS } from "./contracts.constants";

export const readLocalContract = async (publicClient: any, functionName: string, args: any[]) => {
    return publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName,
        args,
    });
};

export const writeLocalContract = async (
    publicClient: any,
    walletClient: any,
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
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName,
        args: [gameId, gameResults],
        account,
    });

    return walletClient.writeContract(request);
};
