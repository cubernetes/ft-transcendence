import { Result, err, ok } from "neverthrow";
import { ErrorCode, GetMePayload, GetMeResponse } from "@darrenkuro/pong-core";
import { sendApiRequest } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createGameStatsChart } from "../layout/GameStatsChart";
import { createProfilePanel } from "../layout/ProfilePanel";

const fetchPlayerData = async (): Promise<Result<GetMePayload, ErrorCode>> => {
    const tryFetch = await sendApiRequest.get<GetMeResponse>(`${CONST.API.USER}/me`);

    if (tryFetch.isErr()) return err(tryFetch.error);

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!tryFetch.value.success) return err("UNKNOWN_ERROR");

    return ok(tryFetch.value.data);
};

export const createProfilePage = async (): Promise<UIComponent> => {
    const playerData = await fetchPlayerData();
    if (playerData.isErr()) return []; // TODO: add fetch error component

    const profileSection = createProfilePanel(playerData.value);
    const statsSection = createGameStatsChart(playerData.value.games);
    const main = createEl("main", "container mx-auto p-4", {
        children: [...profileSection, ...statsSection],
    });

    return [main];
};
