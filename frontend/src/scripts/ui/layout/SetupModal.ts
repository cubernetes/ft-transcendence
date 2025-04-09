import { createEl } from "../../utils/dom-helper";
import { createButtonGroup } from "../components/ButtonGroup";
import { createReturnButton } from "../components/ReturnButton";

const createContainer = () => {
    const tw =
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto flex flex-col justify-center items-center shaded relative";
    return createEl("section", tw);
};

const createSetupTitle = (text: string) => {
    const tw = "text-6xl font-bold mb-4 text-center text-black";
    const setupTitle = createEl("h2", tw, { text });
    return setupTitle;
};

const createSetupLine = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const createDifficultyGroup = () => {
    const difficultyLabel = createEl("p", "text-xl text-black", { text: "Difficulty" });
    const difficultyButtons = createButtonGroup(
        ["Easy", "Medium", "Hard"],
        "p-2 bg-gray-100 text-black hover:bg-gray-400"
    );
    const difficultyGroup = createEl("div", "flex flex-col w-full mt-6", {
        children: [difficultyLabel, difficultyButtons],
    });
    return difficultyGroup;
};

export const createSetupModal = (mode: "local" | "remote" | "AI", returnTarget: HTMLElement) => {
    const ctn = createContainer();
    const returnBtn = createReturnButton(ctn, returnTarget);
    const setupTitle = createSetupTitle(
        mode === "local" ? "Play Local" : mode === "remote" ? "Play Online" : "Play AI"
    );
    const setupLine = createSetupLine();
};
