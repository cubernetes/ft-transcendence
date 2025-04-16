import { Result, err, ok } from "neverthrow";
import {
    CategoryScale,
    Chart,
    ChartConfiguration,
    ChartTypeRegistry,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Title,
} from "chart.js";
import { createEl } from "../../utils/dom-helper";

/**
 * Generate a stat chart.
 */
export const createChart = (
    type: keyof ChartTypeRegistry,
    data: Record<string, unknown>[],
    options: ChartConfiguration["options"],
    labelKey: string,
    datasetKeys: string[]
): Result<HTMLCanvasElement, Error> => {
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

    const chartCanvas = createEl("canvas", "min-w-full divide-y divide-gray-200");

    const chart = new Chart(chartCanvas, {
        type,
        data: {
            labels: data.map((d) => `Game ${d[labelKey]}`),
            datasets: datasetKeys.map((key, i) => ({
                label: key.charAt(0).toUpperCase() + key.slice(1),
                data: data.map((d) => d[key]),
                borderColor: ["green", "red", "blue", "purple"][i % 4],
                tension: 0.2,
            })),
        },
        options,
    });

    return ok(chartCanvas);
};
