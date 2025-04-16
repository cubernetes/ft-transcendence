import { Err, Result, err, ok } from "neverthrow";
import { showPageElements } from "../../modules/layout/layout.service";
import { createEl } from "../../utils/dom-helper";
import { createChart } from "../components/Chart";

const fetchPlayerData = async (): Promise<Result<Record<string, unknown>, Error>> => {
    try {
        const response = await fetch(`${window.cfg.url.user}/me`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token") || "Unauthorized",
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }

        const data = await response.json();

        const processedData = {
            id: data.data.id,
            name: data.data.username,
            games: data.data.wins + data.data.losses,
            wins: data.data.wins,
            losses: data.data.losses,
            rank: data.data.rank,
        };

        return ok(processedData);
    } catch (error) {
        window.log.debug("Fetch error:", error);
        return err(new Error("Fail to fetch user"));
    }
};

const fetchGameStats = async (): Promise<Result<Record<string, unknown>[], Error>> => {
    const gameStats = [
        { gameId: 1, hits: 23, misses: 4 },
        { gameId: 2, hits: 18, misses: 7 },
        { gameId: 3, hits: 27, misses: 5 },
        { gameId: 4, hits: 30, misses: 3 },
        { gameId: 5, hits: 25, misses: 6 },
        { gameId: 6, hits: 29, misses: 2 },
        { gameId: 7, hits: 22, misses: 8 },
        { gameId: 8, hits: 26, misses: 4 },
        { gameId: 9, hits: 31, misses: 3 },
        { gameId: 10, hits: 24, misses: 5 },
    ];

    // try {
    // const response = await fetch(`${window.cfg.url.user}/me`, {
    //     headers: {
    //         Authorization: "Bearer " + localStorage.getItem("token") || "Unauthorized",
    //     },
    // });
    //     if (!response.ok) {
    //         throw new Error("Failed to fetch user stats");
    //     }

    //     const data = await response.json();

    //     return ok(data);
    // } catch (error) {
    //     window.log.debug("Fetch error:", error);
    //     return err(new Error("Fail to fetch user"));
    // }

    return ok(gameStats);
};

const createPlayerDataSection = (
    dataResult: Result<Record<string, unknown>, Error>
): HTMLElement => {
    const playerSection = createEl("section", "text-2xl font-bold mb-4", { text: "Your Profile:" });

    if (dataResult.isErr()) {
        playerSection.appendChild(
            createEl("p", "text-red-500", { text: "Failed to query user data." })
        );
        return playerSection;
    }
    const playerInfo = createEl("div", "space-y-4");
    const username = createEl("p", "font-semibold", { text: `Username: Player 1` });
    const stats = createEl("p", "font-semibold", { text: "Games Played: 0" });

    const wrapper = createEl("div", "w-full", {
        children: [playerSection, playerInfo, username, stats],
    });

    return wrapper;
};

const createStatsDataSection = (
    dataResult: Result<Record<string, unknown>[], Error>
): HTMLElement => {
    const statSection = createEl("section", "text-2xl font-bold mb-4", { text: "Your Stats:" });

    if (dataResult.isErr()) {
        statSection.appendChild(
            createEl("p", "text-1xl text-red-500", { text: "Failed to generate chart." })
        );
        return statSection;
    }

    const dataValue = dataResult.value;

    if (dataValue.length < 2) {
        statSection.appendChild(
            createEl("p", "text-1xl text-red-500", { text: "Not enough data to generate chart." })
        );
        return statSection;
    }

    const chartResult = createChart(
        "line",
        dataValue,
        {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Pong Game Performance",
                },
            },
        },
        "gameId",
        ["hits", "misses"]
    );

    if (chartResult.isOk()) {
        statSection.appendChild(chartResult.value);
    } else {
        statSection.appendChild(
            createEl("p", "text-1xl text-red-500", { text: "Failed to generate chart." })
        );
    }

    return statSection;
};

const createProfileSection = async (): Promise<HTMLElement> => {
    const profileSection = createEl("section", "bg-white p-6 rounded-lg shadow-md");

    const playerData = await fetchPlayerData();
    const gameStats = await fetchGameStats();

    const playerSection = createPlayerDataSection(playerData);
    const statsSection = createStatsDataSection(gameStats);

    profileSection.appendChild(playerSection);
    profileSection.appendChild(statsSection);

    return profileSection;
};

export const createProfilePage = async (): Promise<HTMLElement[]> => {
    showPageElements();
    const profileSection = await createProfileSection();
    const main = createEl("main", "container mx-auto p-4", { children: [profileSection] });

    main.appendChild(profileSection);

    return [main];
};
