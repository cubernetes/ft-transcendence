import { createGameModes } from "../../pages/menu/menu.setup";

export const createOnlineMode = (): HTMLElement => {
    const setupSection = document.createElement("section");
    setupSection.className =
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto flex flex-col justify-center items-center shaded relative"; // Add relative to the section

    const setupTitle = document.createElement("h2");
    setupTitle.className = "text-6xl font-bold mb-4 text-center text-black";
    setupTitle.textContent = "Play Online";

    const setupLine = document.createElement("hr");
    setupLine.className = "border-t-2 border-dotted border-white mb-6";

    // Online Mode Buttons
    const onlineButtons = document.createElement("div");
    onlineButtons.className = "flex flex-col space-y-4 items-center mt-4";

    // Create Lobby Button
    const createLobbyButton = document.createElement("button");
    createLobbyButton.className = "w-64 p-4 bg-red-500 text-white rounded text-xl hover:bg-red-700";
    createLobbyButton.textContent = "Create Lobby";

    // Join Lobby Button
    const joinLobbyButton = document.createElement("button");
    joinLobbyButton.className =
        "w-64 p-4 bg-green-500 text-white rounded text-xl hover:bg-green-700";
    joinLobbyButton.textContent = "Join Lobby";

    onlineButtons.appendChild(createLobbyButton);
    onlineButtons.appendChild(joinLobbyButton);

    const returnButton = document.createElement("button");
    returnButton.className =
        "absolute top-8 left-8 p-2 bg-gray-400 text-black rounded text-xl hover:bg-gray-600";
    returnButton.innerHTML = "&#8617;";

    createLobbyButton.onclick = () => {
        console.log("Creating a new lobby...");
    };

    joinLobbyButton.onclick = () => {
        console.log("Joining a lobby...");
    };

    returnButton.onclick = () => {
        setupSection.replaceWith(createGameModes());
    };

    setupSection.appendChild(returnButton);
    setupSection.appendChild(setupTitle);
    setupSection.appendChild(setupLine);
    setupSection.appendChild(onlineButtons);

    return setupSection;
};
