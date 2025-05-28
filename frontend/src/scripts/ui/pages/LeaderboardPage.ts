import { Result, err, ok } from "neverthrow";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createHeading } from "../components/Heading";
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

    const main = createEl("main", "container justify-items-center p-4");
    const section = createEl("section", "p-6");
    const title = createHeading({
        text: "Leaderboard",
        tw: "font-bold mb-4",
    });

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

    const tableWrapper = createEl(
        "div",
        `max-h-64 overflow-y-auto overflow-x-auto flex justify-center ${CONST.STYLES.CONTAINER}`
    );
    tableWrapper.appendChild(table);

    appendChildren(section, [title, tableWrapper]);
    main.appendChild(section);

    return createArcadeWrapper([main]);
};
