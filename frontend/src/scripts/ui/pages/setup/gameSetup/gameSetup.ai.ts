import { createEl } from "../../../../utils/dom-helper";
import { createButton } from "../../../components/Button";
import { createButtonGroup } from "../../../components/ButtonGroup";
import { createGameModes } from "../../SetupPage";

export const createAIMode = (): HTMLElement => {
    // Return button
    const returnBtn = createButton(
        "",
        "absolute top-8 left-8 p-2 bg-gray-400 text-black hover:bg-gray-600",
        () => setupSection.replaceWith(createGameModes())
    );
    returnBtn.innerHTML = "&#8617;";

    // Title
    const setupTitle = createEl("h2", "text-6xl font-bold mb-4 text-center text-black", {
        text: "PlayAI",
    });
    const setupLine = createEl("hr", "border-t-2 border-dotted border-white mb-6");

    // Difficulty
    const difficultyLabel = createEl("p", "text-xl text-black", { text: "Difficulty" });
    const difficultyButtons = createButtonGroup(
        ["Easy", "Medium", "Hard"],
        "p-2 bg-gray-100 text-black hover:bg-gray-400"
    );
    const difficultySection = createEl("div", "flex flex-col w-full mt-6", {
        children: [difficultyLabel, difficultyButtons],
    });

    // Play Button
    const playBtnOnClick = () => {
        const selectedDifficulty = difficultyButtons.querySelector(
            `.${window.cfg.label.activeBtn}`
        );
        if (!selectedDifficulty) {
            return showError("Please select a difficulty.");
        }

        const gameData = {
            difficulty: selectedDifficulty.textContent?.toLowerCase(),
        };
        hideError();
        window.log.debug("Game Data:", gameData);
    };
    const playBtn = createButton(
        "Play",
        "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        playBtnOnClick
    );

    // Error Message
    const errorMessage = createEl(
        "div",
        "hidden p-2 bg-red-100 text-red-500 rounded text-sm mt-4",
        { attributes: { id: "formError" } }
    );

    const showError = (message: string) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    };

    const hideError = () => {
        errorMessage.textContent = "";
        errorMessage.classList.add("hidden");
    };

    const setupSection = createEl(
        "section",
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto flex flex-col justify-center items-center shaded relative",
        {
            children: [returnBtn, setupTitle, setupLine, difficultySection, playBtn, errorMessage],
        }
    );

    return setupSection;
};
