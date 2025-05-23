import { Result, err, ok } from "neverthrow";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createStatus } from "../components/Status";
import { createTable } from "../components/Table";

/**
 * Fetch Leaderboard userdata.
 * @param n number of the top users
 * @returns Result<?, Error>
 */
const fetchLeaderboard = async (n: number): Promise<Result<Record<string, unknown>[], Error>> => {
    try {
        const response = await fetch(`${CONST.API.LEADERBOARD}/${n}`);
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

        return ok(processedData);
    } catch (error) {
        log.debug("Fetch error:", error);

        return err(new Error("Fail to fetch leaderboard"));
    }
};

export const createLeaderboardPage = async (): Promise<UIComponent> => {
    // Define how many players to be fetched
    const n = 10;

    const main = createEl("main", "container mx-auto p-4");
    const section = createEl("section", "bg-white p-6 rounded-lg shadow-md");
    const title = createEl("h2", "text-2xl font-bold mb-4", { text: "Leaderboard" });

    // createTable(header, data);
    const headers = ["Rank", "Player", "Wins", "Losses"];
    const columns = ["rank", "name", "wins", "losses"];
    const players = await fetchLeaderboard(n);

    if (players.isErr()) {
        const { statusEl, showErr } = createStatus();
        showErr("FETCH_ERROR");
        return [statusEl];
    }

    const table = createTable(headers, columns, players.value);

    appendChildren(section, [title, table]);
    main.appendChild(section);

    return [main];
};
