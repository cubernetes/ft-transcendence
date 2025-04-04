import { createGameModes } from "../../pages/menu/menu.setup";

export const createAIMode = (): HTMLElement => {
    const setupSection = document.createElement("section");
    setupSection.className =
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto flex flex-col justify-center items-center shaded relative"; // Add relative to the section

    const setupTitle = document.createElement("h2");
    setupTitle.className = "text-6xl font-bold mb-4 text-center text-black";
    setupTitle.textContent = "Play AI";

    const setupLine = document.createElement("hr");
    setupLine.className = "border-t-2 border-dotted border-white mb-6";

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

    // Play Button
    const playButton = document.createElement("button");
    playButton.className =
        "mt-8 p-4 bg-red-500 text-white rounded text-2xl hover:bg-red-600 w-full";
    playButton.textContent = "Play";

    // Return Button
    const returnButton = document.createElement("button");
    returnButton.className =
        "absolute top-8 left-8 p-2 bg-gray-400 text-black rounded text-xl hover:bg-gray-600";
    returnButton.innerHTML = "&#8617;";

    const errorMessage = document.createElement("div");
    errorMessage.id = "formError";
    errorMessage.className = "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4";
    errorMessage.textContent = "";

    const showError = (message: string) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    };

    const hideError = () => {
        errorMessage.textContent = "";
        errorMessage.classList.add("hidden");
    };

    returnButton.onclick = () => {
        setupSection.replaceWith(createGameModes());
    };

    const setActiveButton = (button: HTMLButtonElement) => {
        if (button.classList.contains("bg-gray-400")) {
            button.classList.remove("bg-gray-400");
            return;
        }
        const buttons = difficultyButtons.querySelectorAll("button");
        buttons.forEach((btn) => btn.classList.remove("bg-gray-400"));

        button.classList.add("bg-gray-400");
    };

    // Add click event listeners to the difficulty buttons
    easyButton.onclick = () => setActiveButton(easyButton);
    mediumButton.onclick = () => setActiveButton(mediumButton);
    hardButton.onclick = () => setActiveButton(hardButton);

    playButton.onclick = () => {
        const selectedDifficulty = difficultyButtons.querySelector(".bg-gray-400");
        if (!selectedDifficulty) {
            showError("Please select a difficulty.");
            return;
        }
        const difficulty =
            selectedDifficulty.textContent === "Easy"
                ? "easy"
                : selectedDifficulty.textContent === "Medium"
                  ? "medium"
                  : "hard";
        const gameData = {
            difficulty: difficulty,
        };
        hideError();
        console.log("Game Data:", gameData);
    };

    setupSection.appendChild(returnButton);
    setupSection.appendChild(setupTitle);
    setupSection.appendChild(setupLine);
    setupSection.appendChild(difficultySection);
    setupSection.appendChild(playButton);
    setupSection.appendChild(errorMessage);

    return setupSection;
};
