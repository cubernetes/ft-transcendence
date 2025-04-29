import { Result, err, ok } from "neverthrow";
import { getText, languageStore } from "../../global/language";
import { hidePageElements, showPageElements } from "../../modules/layout/layout.service";
import { createEl } from "../../utils/dom-helper";
import { createTable } from "../components/Table";

/**
 * Fetch Leaderboard userdata.
 * @param n number of the top users
 * @returns Result<?, Error>
 */
const fetchLeaderboard = async (n: number): Promise<Result<Record<string, unknown>[], Error>> => {
    try {
        const response = await fetch(`${window.cfg.url.user}/leaderboard/${n}`);
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
        window.log.debug("Fetch error:", error);

        return err(new Error("Fail to fetch leaderboard"));
    }
};

export const createLeaderboardPage = async (): Promise<HTMLElement[]> => {
    // Define how many players to be fetched
    const n = 10;

    showPageElements();

    const main = createEl("main", "container mx-auto p-4");
    const section = createEl("section", "bg-white p-6 rounded-lg shadow-md");
    const title = createEl("h2", "text-2xl font-bold mb-4", { text: getText("leaderboard") });

    // createTable(header, data);
    const headers = [getText("rank"), getText("player"), getText("wins"), getText("losses")];
    const columns = ["rank", "name", "wins", "losses"];
    const players = await fetchLeaderboard(n);

    if (players.isErr()) {
        // TODO: Handle error better, element for failed stuff?
        return [];
    }

    const table = createTable(headers, columns, players.value);

    // Error Handling maybe differently? This just don't append it if something went wrong.
    if (table.isOk()) {
        const tableElement = table.value;
        section.appendChild(title);
        section.appendChild(table.value);

        // Subscribe to language changes
        const unsubscribe = languageStore.subscribe(() => {
            title.textContent = getText("leaderboard");

            // Update table headers dynamically
            const updatedHeaders = [
                getText("rank"),
                getText("player"),
                getText("wins"),
                getText("losses"),
            ];
            const headerRow = tableElement.querySelector("thead tr");
            if (headerRow) {
                Array.from(headerRow.children).forEach((th, index) => {
                    th.textContent = updatedHeaders[index];
                });
            }
        });

        main.addEventListener("destroy", () => {
            unsubscribe();
        });
    }

    main.appendChild(section);

    return [main];
};
