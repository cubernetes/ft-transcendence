import { createGameModes } from "../../pages/menu/menu.setup";

export const createLocalMode = (): HTMLElement => {
    const setupSection = document.createElement("section");
    setupSection.className =
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto flex flex-col justify-center items-center shaded relative"; // Add relative to the section

    const setupTitle = document.createElement("h2");
    setupTitle.className = "text-6xl font-bold mb-4 text-center text-black";
    setupTitle.textContent = "Play Local";

    const setupLine = document.createElement("hr");
    setupLine.className = "border-t-2 border-dotted border-white mb-6";

    // Player Names Section
    const playerNames = document.createElement("div");
    playerNames.className = "flex flex-col space-y-4 w-full";

    const player1 = document.createElement("input");
    player1.className = "w-full p-2 bg-gray-100 text-black rounded text-xl";
    player1.placeholder = "Name Player 1";

    const player2 = document.createElement("input");
    player2.className = "w-full p-2 bg-gray-100 text-black rounded text-xl";
    player2.placeholder = "Name Player 2";

    playerNames.appendChild(player1);
    playerNames.appendChild(player2);

    // Mode Section
    const modeSection = document.createElement("div");
    modeSection.className = "flex flex-col w-full mt-6";

    const modeLabel = document.createElement("p");
    modeLabel.className = "text-xl text-black";
    modeLabel.textContent = "Mode";

    const modeButtons = document.createElement("div");
    modeButtons.className = "flex space-x-4 mt-2";

    const mode2P = document.createElement("button");
    mode2P.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";
    mode2P.textContent = "2P";

    const mode4P = document.createElement("button");
    mode4P.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";
    mode4P.textContent = "4P";

    modeButtons.appendChild(mode2P);
    modeButtons.appendChild(mode4P);

    modeSection.appendChild(modeLabel);
    modeSection.appendChild(modeButtons);

    // Difficulty Section
    const difficultySection = document.createElement("div");
    difficultySection.className = "flex flex-col w-full mt-6";

    const difficultyLabel = document.createElement("p");
    difficultyLabel.className = "text-xl text-black";
    difficultyLabel.textContent = "Difficulty";

    const difficultyButtons = document.createElement("div");
    difficultyButtons.className = "flex space-x-4 mt-2";

    const easyButton = document.createElement("button");
    easyButton.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";
    easyButton.textContent = "Easy";

    const mediumButton = document.createElement("button");
    mediumButton.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";
    mediumButton.textContent = "Medium";

    const hardButton = document.createElement("button");
    hardButton.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";
    hardButton.textContent = "Hard";

    difficultyButtons.appendChild(easyButton);
    difficultyButtons.appendChild(mediumButton);
    difficultyButtons.appendChild(hardButton);

    difficultySection.appendChild(difficultyLabel);
    difficultySection.appendChild(difficultyButtons);

    const playButton = document.createElement("button");
    playButton.className =
        "mt-8 p-4 bg-red-500 text-white rounded text-2xl hover:bg-red-600 w-full";
    playButton.textContent = "Play";

    const returnButton = document.createElement("button");
    returnButton.className =
        "absolute top-8 left-8 p-2 bg-gray-400 text-black rounded text-xl hover:bg-gray-600";
    returnButton.innerHTML = "&#8617;";

    returnButton.onclick = () => {
        setupSection.replaceWith(createGameModes());
    };

    const setActiveButton = (button: HTMLButtonElement) => {
        let buttons = [
            ...difficultyButtons.querySelectorAll("button"),
            ...modeButtons.querySelectorAll("button"),
        ];

        buttons.forEach((btn) => btn.classList.remove("bg-gray-400"));

        // Add the 'active' class to the clicked button
        button.classList.add("bg-gray-400");
    };

    // Add click event listeners to the difficulty buttons
    easyButton.onclick = () => setActiveButton(easyButton);
    mediumButton.onclick = () => setActiveButton(mediumButton);
    hardButton.onclick = () => setActiveButton(hardButton);
    mode2P.onclick = () => setActiveButton(mode2P);
    mode4P.onclick = () => setActiveButton(mode4P);

    setupSection.appendChild(returnButton);
    setupSection.appendChild(setupTitle);
    setupSection.appendChild(setupLine);
    setupSection.appendChild(playerNames);
    setupSection.appendChild(modeSection);
    setupSection.appendChild(difficultySection);
    setupSection.appendChild(playButton);

    return setupSection;
};
