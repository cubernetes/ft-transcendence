import { showPageElements } from "../../modules/layout/layout.service";
import { layoutStore } from "../../modules/layout/layout.store";
import { createEl } from "../../utils/dom-helper";
import { createPaddles } from "../layout/Paddles";
import { createQuickPlaySetupModal } from "../layout/SetupModal";

export const createQuickPlayPage = async (): Promise<HTMLElement[]> => {
    const { router } = layoutStore.get();
    const setupSection = createQuickPlaySetupModal();
    const paddles = createPaddles(router);

    // TODO: Check cursor url, doesn't seem to be working?
    const main = createEl("main", "w-full cursor-[url(assets/pongball.cur)]", {
        children: [paddles, setupSection],
    });

    return [main];
};
