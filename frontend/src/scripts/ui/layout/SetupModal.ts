import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createError } from "../components/Error";
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

const createInput = (placeholder: string) =>
    createEl("input", "w-full p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: { placeholder },
    });

const onlineMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Play Online");
    const line = createSetupLine();

    const createLobbyBtnCb = () => {
        window.log.info("Creating a new lobby...");
    };
    const createLobbyBtn = createButton(
        "Create Lobby",
        "w-64 p-4 bg-red-500 text-white hover:bg-red-700",
        createLobbyBtnCb
    );

    const joinLobbyBtnCb = () => {
        window.log.info("Joining a new lobby...");
    };
    const joinLobbyBtn = createButton(
        "Join Lobby",
        "w-64 p-4 bg-green-500 text-whit hover:bg-green-700"
    );

    const BtnGrp = createEl("div", "flex flex-col space-y-4 items-center mt-4", {
        children: [createLobbyBtn, joinLobbyBtn],
    });

    const section = createEl(
        "section",
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto flex flex-col justify-center items-center shaded relative",
        { children: [returnBtn, title, line, BtnGrp] }
    );
    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const aiMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Play AI");
    const line = createSetupLine();

    const difficultyGrp = createDifficultyGroup();

    const { error, show, hide } = createError();

    const playBtnCb = () => {
        const selected = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!selected) {
            return show("Please select a difficulty.");
        }

        const gameData = { difficulty: selected.textContent?.toLowerCase() };
        hide();
        window.log.debug(`Game Data: ${gameData}`);
    };
    const playBtn = createButton(
        "Play",
        "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        playBtnCb
    );

    const setupSection = createEl(
        "section",
        "bg-gray-300 p-8 rounded-lg shadow-md w-1/2 mx-auto flex flex-col justify-center items-center shaded relative",
        {
            children: [returnBtn, title, line, difficultyGrp, playBtn, error],
        }
    );

    ctn.innerHTML = "";
    ctn.appendChild(setupSection);
    //return setupSection;
};

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

    const { error, show, hide } = createError();

    const playBtnCb = () => {
        const player1 = p1.value.trim();
        const player2 = p2.value.trim();
        const mode = modeBtnGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        const difficulty = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!player1 || !player2) {
            return show("Please enter names for both players.");
        }
        if (!mode) {
            return show("Please select a mode.");
        }
        if (!difficulty) {
            return show("Please select a difficulty.");
        }

        const gameData = {
            player1,
            player2,
            mode: mode.textContent,
            difficulty: difficulty.textContent?.toLowerCase(),
        };
        hide();
        window.log.debug(`Game Data: ${gameData}`);
    };
    const playBtn = createButton(
        "Play",
        "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        playBtnCb
    );

    const section = createSectionContainer("bg-gray-300 p-8 w-full items-center shaded relative", [
        returnBtn,
        title,
        line,
        playersSection,
        modeSection,
        difficultyGrp,
        playBtn,
        error,
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
