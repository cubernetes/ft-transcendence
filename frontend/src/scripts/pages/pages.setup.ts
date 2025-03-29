import { createHeader } from "../components/components.header";
import { createFooter } from "../components/components.footer";
import { createGameModes } from "../components/components.gameModes";
import { createPaddles } from "../components/components.paddles";

export const createSetupPage = async (): Promise<HTMLElement> => {
    const container = document.createElement("div");
    container.className = "flex flex-col min-h-screen font-medieval cursor-ball";

    const header = await createHeader();
    const footer = createFooter();

    const main = document.createElement("main");
    main.className = "flex-grow flex items-center justify-center bg-gray-100 w-full";

    const setupSection = createGameModes();
    const paddles = createPaddles(main);

    main.appendChild(paddles);
    main.appendChild(setupSection);

    container.appendChild(header);
    container.appendChild(main);
    container.appendChild(footer);

    return container;
};
