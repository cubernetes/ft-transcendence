import { Result, err, ok } from "neverthrow";
import { ErrorCode, GetMePayload, GetMeResponse } from "@darrenkuro/pong-core";
import { sendApiRequest } from "../../utils/api";
import { fetchPlayerData } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createStatsToggleSection } from "../layout/GameStatsSection";

export const createStatsPage = async (): Promise<UIComponent> => {
    const playerData = await fetchPlayerData();
    if (playerData.isErr()) return []; // TODO: add fetch error component

    const statsSection = createStatsToggleSection(playerData.value.games);
    const main = createEl("main", "w-full h-full flex flex-col p-4", {
        children: [...statsSection],
    });

    return createArcadeWrapper([main]);
};
