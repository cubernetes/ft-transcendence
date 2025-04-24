import { Err, Result } from "neverthrow";
import { TranslationKey, getText, languageStore } from "../../global/language";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createChart } from "../components/Chart";

export const createPlayerDataSection = (
    dataResult: Result<Record<string, unknown>, Error>
): HTMLElement => {
    const playerSection = createEl("section", "bg-white p-6 rounded-lg shadow-md mb-6");

    const translatableElements: Partial<Record<TranslationKey, HTMLElement>> = {};

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
    translatableElements["your_profile"] = title;

    const fields = [
        { label: "username", key: "name" },
        { label: "games_played", key: "games" },
        { label: "wins", key: "wins" },
        { label: "losses", key: "losses" },
    ];

    const infoList = fields.map(({ label, key }) => {
        const fieldElement = createEl("p", "text-gray-700 text-base", {
            text: `${getText(label as TranslationKey)}: ${data[key]}`,
        });
        translatableElements[label as TranslationKey] = fieldElement;
        return fieldElement;
    });

    const rankElement = createEl("p", "", {
        text: `${getText("rank")}: ${rank}`,
    });
    translatableElements["rank"] = rankElement;

    appendChildren(playerSection, [title, avatar, ...infoList, rankElement]);

    // Subscribe to language changes
    const updateTexts = () => {
        title.textContent = getText("your_profile");
        avatar.setAttribute("alt", getText("profile_picture"));
        fields.forEach(({ label, key }) => {
            const el = translatableElements[label as TranslationKey];
            if (el) {
                el.textContent = `${getText(label as TranslationKey)}: ${data[key]}`;
            }
        });
        rankElement.textContent = `${getText("rank")}: ${rank}`;
    };

    const unsubscribe = languageStore.subscribe(() => {
        updateTexts();
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

    const translatableElements: Partial<Record<TranslationKey, HTMLElement>> = {};

    if (dataResult.isErr()) {
        const errorElement = createEl("p", "text-1xl text-red-500", {
            text: getText("failed_generate_chart"),
        });
        translatableElements["failed_generate_chart"] = errorElement;
        statSection.appendChild(errorElement);
        return statSection;
    }

    const dataValue = dataResult.value;

    if (dataValue.length < 2) {
        const notEnoughDataElement = createEl("p", "text-1xl text-red-500", {
            text: getText("not_enough_data"),
        });
        translatableElements["not_enough_data"] = notEnoughDataElement;
        statSection.appendChild(notEnoughDataElement);
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
        const failedChartElement = createEl("p", "text-1xl text-red-500", {
            text: getText("failed_generate_chart"),
        });
        translatableElements["failed_generate_chart"] = failedChartElement;
        statSection.appendChild(failedChartElement);
    }

    // Subscribe to language changes
    const updateTexts = () => {
        statSection.firstChild!.textContent = getText("your_stats");
        const failedChartEl = translatableElements["failed_generate_chart"];
        if (failedChartEl) {
            failedChartEl.textContent = getText("failed_generate_chart");
        }
        const notEnoughDataEl = translatableElements["not_enough_data"];
        if (notEnoughDataEl) {
            notEnoughDataEl.textContent = getText("not_enough_data");
        }
    };

    const unsubscribe = languageStore.subscribe(() => {
        updateTexts();
    });

    statSection.addEventListener("destroy", () => {
        unsubscribe();
    });

    return statSection;
};
