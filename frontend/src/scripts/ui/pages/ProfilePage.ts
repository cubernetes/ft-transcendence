import { Result, err, ok } from "neverthrow";
import { ErrorCode, GetMePayload, GetMeResponse } from "@darrenkuro/pong-core";
import { sendApiRequest } from "../../utils/api";
import { fetchPlayerData } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createProfilePanel } from "../layout/ProfilePanel";

export const createProfilePage = async (): Promise<UIComponent> => {
    const playerData = await fetchPlayerData();
    if (playerData.isErr()) return []; // TODO: add fetch error component

    const profileSection = createProfilePanel(playerData.value);
    const main = createEl("main", `flex p-4 ${CONST.STYLES.CONTAINER}`, {
        children: [...profileSection],
    });

    return createArcadeWrapper([main]);
};
