import { Err, Result, err, ok } from "neverthrow";
import { createEl } from "../../utils/dom-helper";
import { appendChildren } from "../../utils/dom-helper";
import { createChart } from "../components/Chart";

export const createPlayerDataSection = (
    dataResult: Result<Record<string, unknown>, Error>
): HTMLElement => {
    const playerSection = createEl("section", "bg-white p-6 rounded-lg shadow-md mb-6");

    if (dataResult.isErr()) {
        playerSection.appendChild(
            createEl("p", "text-red-500 text-lg", { text: "Failed to query user data." })
        );
        return playerSection;
    }

    const data = dataResult.value;
    const name = `${data.name}`;
    const rank = `${data.rank}`;
    let profilePicturePath = `${data.img}`;

    const avatar = createEl("img", "w-20 h-20 rounded-full mb-4", {
        attributes: {
            src: profilePicturePath,
            alt: "Player Profile Picture",
        },
    });

    const title = createEl("h2", "text-2xl font-bold mb-4", { text: "Your Profile" });

    const fields = [
        { label: "Username", value: name },
        { label: "Games Played", value: data.games },
        { label: "Wins", value: data.wins },
        { label: "Losses", value: data.losses },
    ];

    const infoList = fields.map(({ label, value }) =>
        createEl("p", "text-gray-700 text-base", {
            text: `${label}: ${value}`,
        })
    );

    const rankElement = createEl("p", "", {
        text: `Rank: ${rank}`,
    });

    appendChildren(playerSection, [title, avatar, ...infoList, rankElement]);

    return playerSection;
};

export const createStatsDataSection = (
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
            events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
            plugins: {
                title: {
                    display: true,
                    text: "Pong Game Performance",
                },
                tooltip: {
                    enabled: true,
                    mode: "nearest",
                    intersect: false,
                },
            },
            interaction: {
                mode: "nearest",
                intersect: false,
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
