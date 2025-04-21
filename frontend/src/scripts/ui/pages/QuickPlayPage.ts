import { layoutStore } from "../../modules/layout/layout.store";
import { createEl } from "../../utils/dom-helper";
import { createPaddles } from "../layout/Paddles";
import { createSetupModal } from "../layout/SetupModal";

export const createQuickPlayPage = async (): Promise<HTMLElement[]> => {
    const { router } = layoutStore.get();
    const setupSection = createSetupModal();
    const paddles = createPaddles(router);

    // TODO: Check cursor url, doesn't seem to be working?
    const main = createEl("main", "w-full cursor-[url(assets/pongball.cur)]", {
        children: [paddles, setupSection],
    });

    return [main];
};
