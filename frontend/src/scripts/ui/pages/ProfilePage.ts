import { Result, err, ok } from "neverthrow";
import { ErrorCode, GetMePayload, GetMeResponse } from "@darrenkuro/pong-core";
import { sendApiRequest } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createStatsToggleSection } from "../layout/GameStatsSection";
import { createProfilePanel } from "../layout/ProfilePanel";

const fetchPlayerData = async (): Promise<Result<GetMePayload, ErrorCode>> => {
    const tryFetch = await sendApiRequest.get<GetMePayload>(CONST.API.ME);
    if (tryFetch.isErr()) return err(tryFetch.error);

    return ok(tryFetch.value);
};

export const createProfilePage = async (): Promise<UIComponent> => {
    const playerData = await fetchPlayerData();
    if (playerData.isErr()) return []; // TODO: add fetch error component

    const profileSection = createProfilePanel(playerData.value);
    const statsSection = createStatsToggleSection(playerData.value.games);
    const main = createEl("main", "container mx-auto p-4", {
        children: [...profileSection, ...statsSection],
    });

    return [main];
};
