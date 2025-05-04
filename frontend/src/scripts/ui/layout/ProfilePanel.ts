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
import { createTotpModal } from "./TotpModal";

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

    const titleEl = createTitle({ text: "your_profile", tw: "text-4xl mt-4" });

    const usernameLabel = createParagraph({ text: "username", tw: "mr-8" });
    const usernameEl = createParagraph({ text: user.username });

    const passwordLabel = createParagraph({ text: "password", tw: "mr-8" });
    const passwordBtn = createButton({
        text: "update",
        tw: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
        // TODO: click cb
    });

    const totpLabel = createParagraph({ text: "TOTP", tw: "mr-8" });
    const totpOnEl = createButtonGroup({
        texts: ["update", "disable"],
        cbs: [() => createTotpModal("update"), () => createTotpModal("disable")],
        twBtn: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpOffEl = createButton({
        text: "enable",
        click: () => createTotpModal("setup"),
        tw: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpEl = user.totpEnabled ? totpOnEl : totpOffEl;

    const rankLabel = createParagraph({ text: "rank", tw: "mr-8" });
    const rankEl = createParagraph({ text: String(user.rank) });

    const labelCtn = createContainer({
        tw: "flex-col w-full bg-blue-300",
        children: [usernameLabel, passwordLabel, totpLabel, rankLabel],
    });

    const contentCtn = createContainer({
        tw: "flex-col w-full bg-yellow-300",
        children: [usernameEl, passwordBtn, totpEl, rankEl],
    });

    const settingCtn = createContainer({
        tw: "flex mx-auto bg-green-300",
        children: [labelCtn, contentCtn],
    });

    // Create left container to include infos and settings
    const leftCtn = createContainer({
        tw: "w-3/5 flex-col bg-red-300",
        children: [titleEl, settingCtn],
    });

    // Create right container to include avartar
    const rightCtn = createContainer({
        tw: "w-2/5 flex justify-center bg-blue-300",
        children: [avatarEl],
    });

    // Create the root container for profile panel
    const container = createContainer({
        tag: "section",
        tw: "flex bg-white rounded-lg shadow-md justify-evenly",
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
