import { createHeader } from "../components/components.header";
import { createFooter } from "../components/components.footer";
import { create3DGameSection } from "../game/game.section";
import { connectBlockchain } from "../components/components.blockchain";

export const createGamePage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4";

    const connectButton = await connectBlockchain();
    main.appendChild(connectButton);

    const game3DSection = await create3DGameSection();
    main.appendChild(game3DSection);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    container.addEventListener("destroy", () => {
        game3DSection.dispatchEvent(new Event("destroy"));
    });

    return container;
};
