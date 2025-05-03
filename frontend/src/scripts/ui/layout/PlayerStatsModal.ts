import { Result } from "neverthrow";
import { PersonalUser, PublicUser } from "@darrenkuro/pong-core";
import { getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createChart } from "../components/Chart";
import { createApiError } from "../components/Error";
import { createBodyText } from "../components/Text";

// TODO: Change name to profile or setting
export const createProfileSetting = (data: Result<PersonalUser, Error>): HTMLElement => {
    const playerSection = createEl("section", "bg-white p-6 rounded-lg shadow-md mb-6");
    if (data.isErr()) return createApiError(playerSection, data.error.message);

    const user = data.value;

    log.debug(user);
    // TODO: Click, upload
    const avatarEl = createEl("img", "w-20 h-20 rounded-full mb-4", {
        attributes: {
            src: user.avatarUrl,
            alt: getText("profile_picture"),
            [CONST.ATTR.I18N_ALT]: "profile_picture",
        },
    });

    const titleEl = createEl("h2", "text-2xl font-bold mb-4", {
        text: getText("your_profile"),
        attributes: { [CONST.ATTR.I18N_TEXT]: "your_profile" },
    });
    const usernameEl = createBodyText("username");

    // totp on
    const totpUpdateCb = () => {};
    const totpEnableCb = () => {};
    const totpDisableCb = () => {};

    // const totpOnSettings = createButtonGroup(["update", "disable"], [totpUpdateCb, totpDisableCb]);
    const totpOffSetting = createButton({ text: "enable", click: totpEnableCb });
    //const totpSettingEl = user.totpEnabled ? totpOnSettings : totpOffSetting;
    // const fields = [
    //     { label: "username", key: "username" },
    //     { label: "games_played", key: "games" },
    //     { label: "wins", key: "wins" },
    //     { label: "losses", key: "losses" },
    // ];

    // const infoList = fields.map(({ label, key }) => {
    //     const fieldElement = createEl("p", "text-gray-700 text-base", {
    //         text: `${getText(label as TranslationKey)}: ${data[key]}`,
    //     });
    //     translatableElements[label as TranslationKey] = fieldElement;
    //     return fieldElement;
    // });

    const rankEl = createBodyText("rank");

    //appendChildren(playerSection, [titleEl, avatarEl, usernameEl, totpSettingEl, rankEl]);

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
        return statSection;
    }

    const dataValue = dataResult.value;

    if (dataValue.length < 2) {
        const notEnoughDataElement = createEl("p", "text-1xl text-red-500", {
            text: getText("not_enough_data"),
        });
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
        statSection.appendChild(failedChartElement);
    }

    return statSection;
};
