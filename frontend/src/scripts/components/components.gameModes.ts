export const createGameModes = async (): Promise<HTMLElement> => {
    const setupSection = document.createElement("section");
    setupSection.className =
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto justify-center items-center mt-16 mb-16";

    const setupTitle = document.createElement("h2");
    setupTitle.className = "text-6xl font-bold mb-4 text-center text-white items-center";
    setupTitle.textContent = "Choose Game Mode";

    const setupLine = document.createElement("hr");
    setupLine.className = "border-t-2 border-dotted border-white";

    const gameModes = document.createElement("div");
    gameModes.className = "flex flex-row space-x-4 justify-between items-center mt-4";

    const localButton = document.createElement("button");
    localButton.className = "w-80 p-2 bg-gray-100 text-black rounded text-xl hover:bg-gray-300";
    localButton.textContent = "Local";

    const onlineButton = document.createElement("button");
    onlineButton.className = "w-80 p-2 bg-gray-100 text-black rounded text-xl hover:bg-gray-300";
    onlineButton.textContent = "Online";

    const aiButton = document.createElement("button");
    aiButton.className = "w-80 p-2 bg-gray-100 text-black rounded text-xl hover:bg-gray-300";
    aiButton.textContent = "AI";

    // Create a container for the tournament button
    const tournamentButton = document.createElement("button");
    tournamentButton.className = "w-full p-2 bg-gray-100 text-black rounded text-xl mt-4";

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
