import { createEl } from "../../utils/dom-helper";
import { createStatus } from "./Status";

export const createTable = (
    headers: string[],
    columns: string[],
    data: Record<string, unknown>[]
): HTMLElement => {
    const table = createEl("table", "min-w-full divide-y divide-gray-200");
    const thead = createEl("thead", "bg-gray-50");
    const headerRow = createEl("tr");

    headers.forEach((h) => {
        const th = createEl(
            "th",
            "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
            { text: h }
        );
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = createEl("tbody", "bg-white divide-y divide-gray-200");

    for (const i of data) {
        const row = createEl("tr");
        for (const key of columns) {
            if (!Object.hasOwn(i, key)) {
                const { statusEl, showErr } = createStatus();
                showErr(`Fail to create table: ${key} doesn't exist on data`);
                return statusEl;
            }
            const cell = createEl("td", "px-6 py-4 whitespace-nowrap", {
                text: String(i[key]),
            });
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    return table;
};
