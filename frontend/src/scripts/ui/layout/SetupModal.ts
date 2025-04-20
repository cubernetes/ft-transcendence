import { gameStore } from "../../modules/game/game.store";
import { sendGameStart } from "../../modules/ws/ws.service";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createError } from "../components/Error";
import { createReturnButton } from "../components/ReturnButton";
import { createSectionContainer } from "../components/SectionContainer";
import { createBodyText, createTitleText } from "../components/Text";

const createSetupLine = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const createPlayBtn = (cb: () => void) =>
    createButton("Play", "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full", cb);

const createDifficultyGroup = () => {
    const label = createBodyText("Difficulty");
    const btns = createButtonGroup(["Easy", "Medium", "Hard"], []);
    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [label, btns],
    });
    return difficultyGrp;
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
        "w-64 p-4 bg-green-500 text-white hover:bg-green-700"
    );

    const BtnGrp = createEl("div", "flex flex-col space-y-4 items-center mt-4", {
        children: [createLobbyBtn, joinLobbyBtn],
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center shaded relative", [
        returnBtn,
        title,
        line,
        BtnGrp,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const aiMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Play AI");
    const line = createSetupLine();
    const difficultyGrp = createDifficultyGroup();
    const { errorDiv, showErr, hideErr } = createError();

    const playBtnCb = () => {
        const selected = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!selected) {
            return showErr("Please select a difficulty.");
        }

        const difficulty = selected.textContent?.toUpperCase() || "MEDIUM";
        hideErr();

        // Get the game controller and start AI game
        const { controller } = gameStore.get();
        if (!controller) {
            return showErr("Game controller not initialized.");
        }

        // // Navigate to AI game page using hash routing
        // window.location.hash = "aigame";

        // // Start the game after a small delay to ensure page rendering is complete
        // setTimeout(() => {
        //     controller.startGame("ai", undefined, { aiDifficulty: difficulty });
        // }, 100);
    };

    const playBtn = createPlayBtn(playBtnCb);

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center shaded relative", [
        returnBtn,
        title,
        line,
        difficultyGrp,
        playBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
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

    const difficultyGrp = createDifficultyGroup();
    const { errorDiv, showErr, hideErr } = createError();

    const playBtnCb = () => {
        const player1 = p1.value.trim();
        const player2 = p2.value.trim();
        const mode = modeBtnGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        const difficulty = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!player1 || !player2) {
            return showErr("Please enter names for both players.");
        }
        if (!mode) {
            return showErr("Please select a mode.");
        }
        if (!difficulty) {
            return showErr("Please select a difficulty.");
        }

        const gameData = {
            player1,
            player2,
            mode: mode.textContent,
            difficulty: difficulty.textContent?.toLowerCase(),
        };
        hideErr();
        window.log.debug(`Game Data: ${gameData}`);
    };
    const playBtn = createPlayBtn(playBtnCb);

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center shaded relative", [
        returnBtn,
        title,
        line,
        playersSection,
        modeSection,
        difficultyGrp,
        playBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
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

    const wrapper = createEl("div", "w-full", { children: [section] });

    return wrapper;
};
