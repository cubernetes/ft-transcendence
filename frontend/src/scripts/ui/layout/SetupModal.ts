import { navigateTo } from "../../global/router";
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

const createCtaBtn = (text: string, cb: () => void): HTMLButtonElement => {
    return createButton(
        text,
        "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        cb
    );
};

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
        "w-64 p-4 bg-blue-500 text-white hover:bg-blue-700"
    );

    const BtnGrp = createEl("div", "flex flex-col space-y-4 items-center mt-4", {
        children: [createLobbyBtn, joinLobbyBtn],
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
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

    const playBtn = createCtaBtn("Play", playBtnCb);

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
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
        navigateTo("localgame");
        window.log.debug(
            "Navigated to localgame via navigateTo(localgame) with gameData:",
            gameData
        );
    };
    const playBtn = createCtaBtn("Play", playBtnCb);

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
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

const tournamentStart = (ctn: HTMLElement, playerAmount: number) => {
    //TODO: Return should go to the previous step rather than the SetupModal.
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Start tournament");
    const line = createSetupLine();

    const { errorDiv, showErr, hideErr } = createError();

    const playerInputs: HTMLInputElement[] = [];
    for (let i = 0; i < playerAmount; i++) {
        const playerInput = createInput(`Name Player${i + 1}`);
        playerInputs.push(playerInput);
    }

    const tournamentStartBtnCb = () => {
        for (let i = 0; i < playerAmount; i++) {
            const playerInput = playerInputs[i];
            if (!playerInput.value.trim()) {
                return showErr(`Please enter a name for Player ${i + 1}.`);
            }
        }

        hideErr();
        window.log.debug(`Tournament Start Data: ${playerInputs}`);
    };

    const tournamentCreateBtn = createCtaBtn("Start Tournament", tournamentStartBtnCb);

    const inputsWrapper = createEl("div", "grid grid-cols-1 md:grid-cols-2 gap-4 w-full", {
        children: playerInputs,
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        inputsWrapper,
        tournamentCreateBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const tournamentMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Create a tournament");
    const line = createSetupLine();

    const playerAmountInput = createInput("Number of players");

    const { errorDiv, showErr, hideErr } = createError();

    const tournamentStartBtnCb = () => {
        const playerAmount = playerAmountInput.value.trim();
        if (!playerAmount) {
            return showErr("Please enter a player amount.");
        }

        if (isNaN(parseInt(playerAmount))) {
            return showErr("Player amount must be a number.");
        }

        if (
            parseInt(playerAmount) < 2 ||
            parseInt(playerAmount) > 10 ||
            parseInt(playerAmount) % 2 !== 0
        ) {
            return showErr("Player amount must be an even number within 2 and 10.");
        }

        hideErr();
        window.log.debug(`Tournament Setup Data: ${playerAmount}`);
        tournamentStart(ctn, parseInt(playerAmount));
    };

    const tournamentCreateBtn = createCtaBtn("Create Tournament", tournamentStartBtnCb);

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        playerAmountInput,
        tournamentCreateBtn,
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
        "flex-1",
        "mt-4"
    );

    const tournamentCreateBtnCb = () => tournamentMode(wrapper);
    const tournamentBtn = createButton("Tournament Mode", "w-full mt-4", tournamentCreateBtnCb);

    // TODO: check what shaded is? couldn't find it (JK removed it)
    // justify-center and items-center has no effects here.. so deleted but noted here because a little confused
    const section = createSectionContainer("w-1/2 bg-gray-300 p-8", [
        title,
        line,
        gameBtnGrp,
        tournamentBtn,
    ]);

    const wrapper = createEl("div", "w-full", { children: [section] });

    return wrapper;
};

export const createQuickPlaySetupModal = (): HTMLElement => {
    const title = createTitleText("Choose Game Mode");
    const line = createSetupLine();

    const localBtnCb = () => localMode(wrapper);
    const aiBtnCb = () => aiMode(wrapper);

    const gameBtnGrp = createButtonGroup(["Local", "AI"], [localBtnCb, aiBtnCb], "flex-1", "mt-4");

    // TODO: check what shaded is? couldn't find it (JK removed it)
    // justify-center and items-center has no effects here.. so deleted but noted here because a little confused
    const section = createSectionContainer("w-1/2 bg-gray-300 p-8", [title, line, gameBtnGrp]);

    const wrapper = createEl("div", "w-full", { children: [section] });

    return wrapper;
};
