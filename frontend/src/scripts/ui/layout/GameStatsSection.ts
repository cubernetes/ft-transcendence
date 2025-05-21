import { Chart, registerables } from "chart.js";
import { PublicGame } from "@darrenkuro/pong-core";
import { authStore } from "../../modules/auth/auth.store";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createTable } from "../components/Table";

Chart.register(...registerables);

export const createStatsToggleSection = (games: PublicGame[]): HTMLElement[] => {
    const { STATS_CHART, MATCH_HISTORY } = CONST.TEXT;
    const chartSection = createGameStatsChart(games);
    const historySection = createMatchHistoryList(games);

    const toggleContainer = createEl("div", "flex justify-center gap-4 mb-4 mt-4");
    const contentContainer = createEl("div", "w-full");

    const chartBtn = createButton({
        text: STATS_CHART,
        tw: "px-4 py-2 border rounded transition",
        click: () => showChart(),
    });

    const historyBtn = createButton({
        text: MATCH_HISTORY,
        tw: "px-4 py-2 border rounded transition",
        click: () => showHistory(),
    });

    const showChart = () => {
        contentContainer.replaceChildren(...chartSection);
        chartBtn.classList.add("bg-purple-600", "text-white");
        historyBtn.classList.remove("bg-purple-600", "text-white");
    };

    const showHistory = () => {
        contentContainer.replaceChildren(...historySection);
        historyBtn.classList.add("bg-purple-600", "text-white");
        chartBtn.classList.remove("bg-purple-600", "text-white");
    };

    toggleContainer.append(chartBtn, historyBtn);
    showChart(); // Default

    return [toggleContainer, contentContainer];
};
