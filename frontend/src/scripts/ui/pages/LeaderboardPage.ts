import { Result } from "neverthrow";
import { USER_URL } from "../../global/config";
import { createEl } from "../../utils/dom-helper";
import { logger } from "../../utils/logger";
import { createFooter } from "../components/components.footer";
import { createHeader } from "../components/components.header";
import { createTable } from "../components/components.table";

/**
 * Fetch Leaderboard userdata.
 * @param n number of the top users
 * @returns Result<?, Error>
 */
const fetchLeaderboard = async (n: number): Promise<Result<Record<string, unknown>[], Error>> => {
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

export const createLeaderboardPage = async (): Promise<HTMLElement[]> => {
    // Define how many players to be fetched
    const n = 10;

    const header = await createHeader();
    const footer = createFooter();

    const main = createEl("main", "container mx-auto p-4 font-medieval");
    const section = createEl("section", "bg-white p-6 rounded-lg shadow-md");
    const title = createEl("h2", "text-2xl font-bold mb-4", { text: "Leaderboard" });

    // createTable(header, data);
    const headers = ["Rank", "Player", "Wins", "Losses"];
    const columns = ["rank", "name", "wins", "losses"];
    const players = await fetchLeaderboard(n);

    if (players.isErr()) {
        // TODO: Handle error better, element for failed stuff?
        return [header, footer];
    }

    const table = createTable(headers, columns, players.value);

    // Error Handling maybe differently? This just don't append it if something went wrong.
    if (table.isOk()) {
        section.appendChild(title);
        section.appendChild(table.value);
    }

    main.appendChild(section);

    return [header, main, footer];
};
