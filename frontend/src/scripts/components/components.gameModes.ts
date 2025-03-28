export const createGameModes = async (): Promise<HTMLElement> => {
    const setupSection = document.createElement("section");
    setupSection.className = "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto justify-center items-center mt-16 mb-16";

    const setupTitle = document.createElement("h2");
    setupTitle.className = "text-6xl font-bold mb-4 text-center text-white items-center";
    setupTitle.textContent = "Choose Game Mode";

    const setupLine = document.createElement("hr");
    setupLine.className = "border-t-2 border-dotted border-white";

    const gameModes = document.createElement("div");
    gameModes.className = "flex flex-row space-x-4 justify-center items-center mt-4";

    const localButton = document.createElement("button");
    localButton.className = "w-60 p-2 bg-gray-100 text-black rounded text-xl";
    localButton.textContent = "Local";

    const onlineButton = document.createElement("button");
    onlineButton.className = "w-60 p-2 bg-gray-100 text-black rounded text-xl";
    onlineButton.textContent = "Online";

    const aiButton = document.createElement("button");
    aiButton.className = "w-60 p-2 bg-gray-100 text-black rounded text-xl";
    aiButton.textContent = "AI";

    const tournamentButtonContainer = document.createElement("div");
    tournamentButtonContainer.className = "w-60 mt-4"; // Container to center the button and give it the same width as the others
    
    const tournamentButton = document.createElement("button");
    tournamentButton.className = "w-full p-2 bg-gray-100 text-black rounded text-xl"; // w-full makes it take up the full width of the container
    tournamentButton.textContent = "Tournament Mode";
    
    tournamentButtonContainer.appendChild(tournamentButton);

    gameModes.appendChild(localButton);
    gameModes.appendChild(onlineButton);
    gameModes.appendChild(aiButton);
    setupSection.appendChild(setupTitle);
    setupSection.appendChild(setupLine);
    setupSection.appendChild(gameModes);
    setupSection.appendChild(tournamentButtonContainer); // Append the container for proper alignment

    localButton.onclick = async () => {
        console.log("Local Game Mode");
    };

    onlineButton.onclick = async () => {
        console.log("Online Game Mode");
    };

    aiButton.onclick = async () => {
        console.log("AI Game Mode");
    };

    tournamentButton.onclick = async () => {
        console.log("Tournament Game Mode");
    };

    return setupSection;
};
