import { Result } from "neverthrow";
import { PersonalUser, PublicUser } from "@darrenkuro/pong-core";
import { getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createChart } from "../components/Chart";
import { createContainer } from "../components/Container";
import { createApiError } from "../components/Error";
import { createParagraph } from "../components/Paragraph";
import { createTitle } from "../components/Title";

export const createProfilePanel = (user: PersonalUser): UIComponent => {
    log.debug(user);

    // TODO: Click, upload
    const avatarEl = createEl("img", "w-64 h-64 rounded-full", {
        attributes: {
            src: user.avatarUrl,
            alt: getText("profile_picture"),
            [CONST.ATTR.I18N_ALT]: "profile_picture",
        },
    });

    const TitleEl = createTitle({ text: "your_profile" });
    const titleEl = createEl("h2", "text-2xl font-bold mt-4", {
        text: getText("your_profile"),
        attributes: { [CONST.ATTR.I18N_TEXT]: "your_profile" },
    });
    const usernameEl = createParagraph({ text: "username" });

    // totp on
    const totpUpdateCb = () => {};
    const totpEnableCb = () => {};
    const totpDisableCb = () => {};

    const totpOnSettings = createButtonGroup({
        texts: ["update", "disable"],
        cbs: [totpUpdateCb, totpDisableCb],
    });
    const totpOffSetting = createButton({ text: "enable", click: totpEnableCb });
    const totpSettingEl = user.totpEnabled ? totpOnSettings : totpOffSetting;
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

    const rankEl = createParagraph({ text: "rank" });

    // Create left container to include infos and settings
    const leftCtn = createContainer({
        tw: "w-3/5 flex-col bg-red-300",
        children: [titleEl, usernameEl, totpSettingEl, rankEl],
    });

    // Create right container to include avartar
    const rightCtn = createContainer({
        tw: "w-2/5 justify-center bg-blue-300",
        children: [avatarEl],
    });

    // Create the root container for profile panel
    const container = createContainer({
        tag: "section",
        tw: "bg-white rounded-lg shadow-md justify-evenly",
        children: [leftCtn, rightCtn],
    });

    return [container];
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
