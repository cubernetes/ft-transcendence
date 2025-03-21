const API_BASE_URL = "/api";

export const fetchTestData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/all`);
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
        console.error("Fetch error:", error);

        throw error;
    }
};
