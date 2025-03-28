import { createHeader } from "../components/components.header";
import { createFooter } from "../components/components.footer";
import { createGameModes } from "../components/components.gameModes";

export const createSetupPage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = await createHeader();

    const main = document.createElement("main");
    main.className = "mx-auto font-medieval bg-gray-100 w-full";

    const setupSection = await createGameModes();

    main.appendChild(setupSection);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
