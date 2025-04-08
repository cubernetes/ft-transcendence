import { createEl } from "../../../utils/dom-helper";
import { createFooter } from "../../components/components.footer";
import { createHeader } from "../../components/components.header";
import { createTable } from "../../components/components.table";
import { fetchLeaderboard } from "./leaderboard.api";

export const createLeaderboardPage = async (): Promise<HTMLElement[]> => {
    const header = await createHeader();
    const footer = createFooter();

    const main = createEl("main", "container mx-auto p-4 font-medieval");
    const section = createEl("section", "bg-white p-6 rounded-lg shadow-md");
    const title = createEl("h2", "text-2xl font-bold mb-4", { text: "Leaderboard" });

    // createTable(header, data);
    const headers = ["Rank", "Player", "Wins", "Losses"];
    const columns = ["rank", "name", "wins", "losses"];
    const players = await fetchLeaderboard(10);
    const table = createTable(headers, columns, players);

    // Error Handling maybe differently? This just don't append it if something went wrong.
    if (table.isOk()) {
        section.appendChild(title);
        section.appendChild(table.value);
    }

    main.appendChild(section);

    return [header, main, footer];
};
