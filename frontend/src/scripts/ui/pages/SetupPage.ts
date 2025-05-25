import { layoutStore } from "../../modules/layout/layout.store";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createContainer } from "../components/Container";
import { createPaddles } from "../layout/Paddles";
import { switchModePanel } from "../layout/SetupPanel";

export const createSetupPage = (): UIComponent => {
    const { router } = layoutStore.get();
    const paddles = createPaddles(router);
    const setupCtn = createContainer({
        tw: "w-1/2 bg-gray-300 p-8 items-center relative",
        id: CONST.ID.SETUP_CTN, // Not using?
    });

    switchModePanel(setupCtn, "base");
    return createArcadeWrapper([setupCtn]);
};
