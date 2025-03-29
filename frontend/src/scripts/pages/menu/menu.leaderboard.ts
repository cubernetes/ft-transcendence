import { createHeader } from "../../components/components.header";
import { createFooter } from "../../components/components.footer";
import { fetchTestData } from "../../test";

export const createLeaderboardPage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = await createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4 font-medieval";

    const leaderboardSection = document.createElement("section");
    leaderboardSection.className = "bg-white p-6 rounded-lg shadow-md";

    const leaderboardTitle = document.createElement("h2");
    leaderboardTitle.className = "text-2xl font-bold mb-4";
    leaderboardTitle.textContent = "Leaderboard";

    const table = document.createElement("table");
    table.className = "min-w-full divide-y divide-gray-200";

    const thead = document.createElement("thead");
    thead.className = "bg-gray-50";

    const headerRow = document.createElement("tr");

    const headers = ["Rank", "Player", "Wins", "Losses"];
    headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.className =
            "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    tbody.className = "bg-white divide-y divide-gray-200";

    // Sample data - in a real app, this would come from your backend
    const players = await fetchTestData();

    players.forEach((player: Record<string, any>) => {
        const row = document.createElement("tr");

        const rankCell = document.createElement("td");
        rankCell.className = "px-6 py-4 whitespace-nowrap";
        rankCell.textContent = player.rank.toString();

        const nameCell = document.createElement("td");
        nameCell.className = "px-6 py-4 whitespace-nowrap";
        nameCell.textContent = player.name;

        const winsCell = document.createElement("td");
        winsCell.className = "px-6 py-4 whitespace-nowrap";
        winsCell.textContent = player.wins.toString();

        const lossesCell = document.createElement("td");
        lossesCell.className = "px-6 py-4 whitespace-nowrap";
        lossesCell.textContent = player.losses.toString();

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(winsCell);
        row.appendChild(lossesCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    leaderboardSection.appendChild(leaderboardTitle);
    leaderboardSection.appendChild(table);

    main.appendChild(leaderboardSection);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
