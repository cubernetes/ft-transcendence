import { layoutStore } from "../../modules/layout/layout.store";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createContainer } from "../components/Container";
import { createPaddles } from "../layout/Paddles";
import { switchModePanel } from "../layout/SetupPanel";

export const createSetupPage = (): UIComponent => {
    const { router } = layoutStore.get();
    //const paddles = createPaddles(router);
    const setupCtn = createContainer({
        tw: "w-full p-8 items-center relative border-2 border-white rounded-lg bg-black/50",
        id: CONST.ID.SETUP_CTN, // Not using?
    });

    switchModePanel(setupCtn, "base");
    return createArcadeWrapper([setupCtn]);
};
