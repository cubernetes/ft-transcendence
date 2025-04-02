import { createHeader } from "../../components/components.header";
import { createFooter } from "../../components/components.footer";
import { createPaddles } from "../../components/components.paddles";
import { createLocalMode } from "../../components/gameSetup/gameSetup.local";
import { createAIMode } from "../../components/gameSetup/gameSetup.ai";
import { createOnlineMode } from "../../components/gameSetup/gameSetup.online";
import { logger } from "../../utils/logger";

export const createSetupPage = async (): Promise<HTMLElement> => {
    const container = document.createElement("div");
    container.className = "flex flex-col min-h-screen font-medieval";

    const header = await createHeader();
    const footer = createFooter();

    const main = document.createElement("main");
    main.className =
        "flex-grow flex items-center justify-center bg-gray-100 w-full cursor-[url(assets/pongball.cur)]";

    const setupSection = createGameModes();
    const paddles = createPaddles(main);

    main.appendChild(paddles);
    main.appendChild(setupSection);

    container.appendChild(header);
    container.appendChild(main);
    container.appendChild(footer);

    return container;
};

export const createGameModes = (): HTMLElement => {
    const setupSection = document.createElement("section");
    setupSection.className =
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto justify-center items-center shaded";

    const setupTitle = document.createElement("h2");
    setupTitle.className = "text-6xl font-bold mb-4 text-center text-black items-center";
    setupTitle.textContent = "Choose Game Mode";

    const setupLine = document.createElement("hr");
    setupLine.className = "border-t-2 border-dotted border-white";

    const gameModes = document.createElement("div");
    gameModes.className = "flex flex-row space-x-4 justify-between items-center mt-4";

    const localButton = document.createElement("button");
    localButton.className = "w-80 p-2 bg-gray-100 text-black rounded text-xl hover:bg-gray-400";
    localButton.textContent = "Local";

    const onlineButton = document.createElement("button");
    onlineButton.className = "w-80 p-2 bg-gray-100 text-black rounded text-xl hover:bg-gray-400";
    onlineButton.textContent = "Online";

    const aiButton = document.createElement("button");
    aiButton.className = "w-80 p-2 bg-gray-100 text-black rounded text-xl hover:bg-gray-400";
    aiButton.textContent = "AI";

    // Create a container for the tournament button
    const tournamentButton = document.createElement("button");
    tournamentButton.className =
        "w-full p-2 bg-gray-100 text-black rounded text-xl mt-4 hover:bg-gray-400";

    // Set the tournament button's text and append it to the section
    tournamentButton.textContent = "Tournament Mode";

    gameModes.appendChild(localButton);
    gameModes.appendChild(onlineButton);
    gameModes.appendChild(aiButton);
    setupSection.appendChild(setupTitle);
    setupSection.appendChild(setupLine);
    setupSection.appendChild(gameModes);
    setupSection.appendChild(tournamentButton); // Append the container for proper alignment

    localButton.onclick = async () => {
        logger.info("Local Game Mode");
        setupSection.replaceWith(createLocalMode());
    };

    onlineButton.onclick = async () => {
        logger.info("Online Game Mode");
        setupSection.replaceWith(createOnlineMode());
    };

    aiButton.onclick = async () => {
        logger.info("AI Game Mode");
        setupSection.replaceWith(createAIMode());
    };

    tournamentButton.onclick = async () => {
        logger.info("Tournament Game Mode");
    };

    return setupSection;
};
