import { createEl } from "../../utils/dom-helper";
import { createStatus } from "./Status";

export const createTable = (
    headers: string[],
    columns: string[],
    data: Record<string, unknown>[]
): HTMLElement => {
    const table = createEl("table", "divide-y divide-gray-200");
    const thead = createEl("thead", "");
    const headerRow = createEl("tr");

    headers.forEach((h) => {
        const th = createEl(
            "th",
            `${CONST.FONT.BODY_XS} px-3 py-3 text-left font-medium text-gray-200 uppercase tracking-wider`,
            { text: h }
        );
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = createEl("tbody", "divide-y divide-gray-200");

    for (const i of data) {
        const row = createEl("tr");
        for (const key of columns) {
            if (!Object.hasOwn(i, key)) {
                const { statusEl, showErr } = createStatus();
                showErr(`Fail to create table: ${key} doesn't exist on data`);
                return statusEl;
            }
            const cell = createEl(
                "td",
                `${CONST.FONT.BODY_XXS} px-2 py-2 text-white whitespace-nowrap`,
                {
                    text: String(i[key]),
                }
            );
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    return table;
};
