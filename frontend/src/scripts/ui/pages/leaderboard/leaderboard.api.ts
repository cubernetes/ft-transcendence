import { logger } from "../../../utils/logger";
import { USER_URL } from "../../config";

export const fetchLeaderboard = async (n: number) => {
    try {
        const response = await fetch(`${USER_URL}/leaderboard/${n}`);
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        // Process data into how it's typed on the leaderboard page
        const processedData = data.data
            .map((p: Record<string, any>) => ({
                id: p.id,
                name: p.username,
                wins: p.wins,
                losses: p.losses,
            }))
            .sort((a: Record<string, any>, b: Record<string, any>) => b.wins - a.wins)
            .map((p: Record<string, any>, i: number) => ({
                ...p,
                rank: i + 1,
            }));

        return processedData;
    } catch (error) {
        logger.debug("Fetch error:", error);

        throw error;
    }
};
