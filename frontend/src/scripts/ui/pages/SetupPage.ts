import { layoutStore } from "../../modules/layout/layout.store";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createContainer } from "../components/Container";
import { switchModePanel } from "../layout/SetupPanel";

export const createSetupPage = (): UIComponent => {
    const setupCtn = createContainer({
        tw: `w-full p-8 items-center relative ${CONST.STYLES.CONTAINER}`,
        id: CONST.ID.SETUP_CTN, // Not using?
    });

    switchModePanel(setupCtn, "base");
    return createArcadeWrapper([setupCtn]);
};
