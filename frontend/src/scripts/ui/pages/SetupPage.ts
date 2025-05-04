import { layoutStore } from "../../modules/layout/layout.store";
import { createContainer } from "../components/Container";
import { createPaddles } from "../layout/Paddles";
import { switchModePanel } from "../layout/SetupPanel";

export const createSetupPage = (): UIComponent => {
    const { router } = layoutStore.get();
    const paddles = createPaddles(router);
    const setupCtn = createContainer({
        tw: "w-1/2 bg-gray-300 p-8 items-center relative",
        id: CONST.ID.SETUP_CTN, // Not using
    });

    // TODO: Check cursor url, doesn't seem to be working?
    // const main = createEl("main", "w-full flex justify-center cursor-[url(assets/pongball.cur)]", {
    //     children: [paddles, setupCtn],
    // });

    switchModePanel(setupCtn, "base");
    return [paddles, setupCtn];
};
