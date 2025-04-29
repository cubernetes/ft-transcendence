import { Err, Result } from "neverthrow";
import { TranslationKey, getText, languageStore } from "../../global/language";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createChart } from "../components/Chart";

export const createPlayerDataSection = (
    dataResult: Result<Record<string, unknown>, Error>
): HTMLElement => {
    const playerSection = createEl("section", "bg-white p-6 rounded-lg shadow-md mb-6");

    if (dataResult.isErr()) {
        playerSection.appendChild(
            createEl("p", "text-red-500 text-lg", { text: getText("failed_query") })
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
            alt: getText("profile_picture"),
        },
    });

    const title = createEl("h2", "text-2xl font-bold mb-4", { text: getText("your_profile") });

    const fields = [
        { label: "username", key: "name" },
        { label: "games_played", key: "games" },
        { label: "wins", key: "wins" },
        { label: "losses", key: "losses" },
    ];

    const infoList = fields.map(({ label, key }) =>
        createEl("p", "text-gray-700 text-base", {
            text: `${getText(label as TranslationKey)}: ${data[key]}`,
        })
    );

    const rankElement = createEl("p", "", {
        text: `${getText("rank")}: ${rank}`,
    });

    appendChildren(playerSection, [title, avatar, ...infoList, rankElement]);

    const unsubscribe = languageStore.subscribe(() => {
        title.textContent = getText("your_profile");
        avatar.setAttribute("alt", getText("profile_picture"));
        fields.forEach(({ label, key }, index) => {
            infoList[index].textContent = `${getText(label as TranslationKey)}: ${data[key]}`;
        });
        rankElement.textContent = `${getText("rank")}: ${rank}`;
    });

    playerSection.addEventListener("destroy", () => {
        unsubscribe();
    });

    return playerSection;
};

export const createStatsDataSection = (
    dataResult: Result<Record<string, unknown>[], Error>
): HTMLElement => {
    const statSection = createEl("section", "text-2xl font-bold mb-4", {
        text: getText("your_stats"),
    });

    if (dataResult.isErr()) {
        const errorElement = createEl("p", "text-1xl text-red-500", {
            text: getText("failed_generate_chart"),
        });
        statSection.appendChild(errorElement);

        // Subscribe to language changes
        const unsubscribe = languageStore.subscribe(() => {
            errorElement.textContent = getText("failed_generate_chart");
        });

        statSection.addEventListener("destroy", () => {
            unsubscribe();
        });

        return statSection;
    }

    const dataValue = dataResult.value;

    if (dataValue.length < 2) {
        const notEnoughDataElement = createEl("p", "text-1xl text-red-500", {
            text: getText("not_enough_data"),
        });
        statSection.appendChild(notEnoughDataElement);

        // Subscribe to language changes
        const unsubscribe = languageStore.subscribe(() => {
            notEnoughDataElement.textContent = getText("not_enough_data");
        });

        statSection.addEventListener("destroy", () => {
            unsubscribe();
        });

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
                    text: getText("pong_game_performance"),
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
        const chartElement = chartResult.value;
        statSection.appendChild(chartElement);

        // Subscribe to language changes
        const unsubscribe = languageStore.subscribe(() => {
            const chartInstance = (chartElement as any).chart; // Assuming chartElement has a `chart` property
            if (chartInstance) {
                chartInstance.options.plugins.title.text = getText("pong_game_performance");
                chartInstance.update(); // Refresh the chart to apply the new text
            }
        });

        statSection.addEventListener("destroy", () => {
            unsubscribe();
        });
    } else {
        const failedChartElement = createEl("p", "text-1xl text-red-500", {
            text: getText("failed_generate_chart"),
        });
        statSection.appendChild(failedChartElement);

        const unsubscribe = languageStore.subscribe(() => {
            failedChartElement.textContent = getText("failed_generate_chart");
        });

        statSection.addEventListener("destroy", () => {
            unsubscribe();
        });
    }

    const unsubscribe = languageStore.subscribe(() => {
        statSection.firstChild!.textContent = getText("your_stats");
    });

    statSection.addEventListener("destroy", () => {
        unsubscribe();
    });

    return statSection;
};
