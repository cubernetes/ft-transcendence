import { fetchPlayerData } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createProfilePanel } from "../layout/ProfilePanel";

export const createProfilePage = async (): Promise<UIComponent> => {
    const playerData = await fetchPlayerData();
    if (playerData.isErr()) return [];

    const profileSection = createProfilePanel(playerData.value);
    const main = createEl("main", `flex p-4 ${CONST.STYLES.CONTAINER}`, {
        children: [...profileSection],
    });

    return createArcadeWrapper([main]);
};
