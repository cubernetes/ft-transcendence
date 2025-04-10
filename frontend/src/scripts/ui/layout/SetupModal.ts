import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createReturnButton } from "../components/ReturnButton";
import { createSectionContainer } from "../components/SectionContainer";
import { createBodyText, createTitleText } from "../components/Text";

const createSetupLine = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const createDifficultyGroup = () => {
    const difficultyLabel = createEl("p", "text-xl text-black", { text: "Difficulty" });
    const difficultyButtons = createButtonGroup(["Easy", "Medium", "Hard"], []);
    const difficultyGroup = createEl("div", "flex flex-col w-full mt-6", {
        children: [difficultyLabel, difficultyButtons],
    });
    return difficultyGroup;
};

// export const createSetupModal = (mode: "local" | "remote" | "AI", returnTarget: HTMLElement) => {
//     const ctn = createContainer();
//     const returnBtn = createReturnButton(ctn, returnTarget);
//     const setupTitle = createSetupTitle(
//         mode === "local" ? "Play Local" : mode === "remote" ? "Play Online" : "Play AI"
//     );
//     const setupLine = createSetupLine();
// };

const createInput = (placeholder: string) =>
    createEl("input", "w-full p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: { placeholder },
    });

const onlineMode = (ctn: HTMLElement) => {};

const aiMode = (ctn: HTMLElement) => {};
const localMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Play Local");
    const line = createSetupLine();

    // Player Section
    const p1 = createInput("Name Player1");
    const p2 = createInput("Name Player2");
    const playersSection = createEl("div", "flex flex-col space-y-4 w-full", {
        children: [p1, p2],
    });

    // Mode Section
    const modeLabel = createBodyText("Mode");
    const modeBtnGrp = createButtonGroup(["2P", "4P"], []);
    const modeSection = createEl("div", "flex flex-col w-full mt-6", {
        children: [modeLabel, modeBtnGrp],
    });

    // Difficulty Section

    const difficultyGrp = createDifficultyGroup();
    const section = createSectionContainer("bg-gray-300 p-8 w-full items-center shaded relative", [
        returnBtn,
        title,
        line,
        playersSection,
        modeSection,
        difficultyGrp,
    ]);
    console.log(ctn);
    ctn.innerHTML = "";
    ctn.appendChild(section);
    //ctn.replaceWith(section);
};

export const createSetupModal = (): HTMLElement => {
    const title = createTitleText("Choose Game Mode");
    const line = createSetupLine();

    const localBtnCb = () => localMode(wrapper);
    const onlineBtnCb = () => onlineMode(wrapper);
    const aiBtnCb = () => aiMode(wrapper);
    const gameBtnGrp = createButtonGroup(
        ["Local", "Online", "AI"],
        [localBtnCb, onlineBtnCb, aiBtnCb],
        "w-80",
        "mt-4"
    );

    const tournamentBtnCb = () => {};
    const tournamentBtn = createButton("Tournament Mode", "w-full mt-4", tournamentBtnCb);

    // TODO: check what shaded is? couldn't find it
    // justify-center and items-center has no effects here.. so deleted but noted here because a little confused
    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 shaded", [
        title,
        line,
        gameBtnGrp,
        tournamentBtn,
    ]);

    const wrapper = createEl("div", "", { children: [section] });

    return wrapper;
};
